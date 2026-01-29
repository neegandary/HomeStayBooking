/**
 * Geocoding Service
 * Converts Vietnamese addresses to latitude/longitude using Nominatim (OpenStreetMap)
 *
 * Note: Nominatim has a rate limit of 1 request per second.
 * This service includes caching to respect rate limits.
 */

import mongoose from 'mongoose';

// Vietnam bounds for validation
const VIETNAM_BOUNDS = {
  minLat: 8.0,
  maxLat: 23.5,
  minLng: 102.0,
  maxLng: 118.0,
};

// In-memory cache for geocoding results
// In production, consider using Redis for distributed caching
const geocodeCache = new Map<string, GeocodeResult>();

// Cache TTL in milliseconds (24 hours)
const CACHE_TTL = 24 * 60 * 60 * 1000;

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  timestamp: number;
}

export interface GeocodeError {
  error: string;
}

/**
 * Clean and normalize Vietnamese address
 */
function normalizeAddress(address: string): string {
  return address
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/,/g, '')
    .trim();
}

/**
 * Validate coordinates are within Vietnam bounds
 */
export function validateVietnamBounds(lat: number, lon: number): boolean {
  return (
    lat >= VIETNAM_BOUNDS.minLat &&
    lat <= VIETNAM_BOUNDS.maxLat &&
    lon >= VIETNAM_BOUNDS.minLng &&
    lon <= VIETNAM_BOUNDS.maxLng
  );
}

/**
 * Get cached geocoding result
 */
function getCachedResult(address: string): GeocodeResult | null {
  const normalizedAddress = normalizeAddress(address);
  const cached = geocodeCache.get(normalizedAddress);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached;
  }

  // Remove expired entry
  if (cached) {
    geocodeCache.delete(normalizedAddress);
  }

  return null;
}

/**
 * Cache geocoding result
 */
function cacheResult(address: string, result: GeocodeResult): void {
  const normalizedAddress = normalizeAddress(address);
  geocodeCache.set(normalizedAddress, {
    ...result,
    timestamp: Date.now(),
  });
}

/**
 * Geocode a Vietnamese address to coordinates using Nominatim
 *
 * @param address - Full address in Vietnamese (e.g., "123 Nguyễn Văn Linh, Đà Nẵng")
 * @returns GeocodeResult with lat/lon or null if not found
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  // Check cache first
  const cached = getCachedResult(address);
  if (cached) {
    console.log(`[Geocoding] Cache hit for: ${address}`);
    return cached;
  }

  // Add Vietnam to address for better results
  const searchAddress = `${address}, Vietnam`;

  try {
    const encodedAddress = encodeURIComponent(searchAddress);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=vn`;

    console.log(`[Geocoding] Requesting: ${searchAddress}`);

    const response = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent header
        'User-Agent': 'StayEasy-Booking/1.0 (contact@stayeasy.com)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log(`[Geocoding] No results for: ${address}`);
      return null;
    }

    const result: GeocodeResult = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
      timestamp: Date.now(),
    };

    // Validate result is in Vietnam
    if (!validateVietnamBounds(result.lat, result.lon)) {
      console.warn(
        `[Geocoding] Result outside Vietnam bounds: ${result.lat}, ${result.lon}`
      );
    }

    // Cache the result
    cacheResult(address, result);

    console.log(
      `[Geocoding] Success: ${result.lat}, ${result.lon}`
    );

    return result;
  } catch (error) {
    console.error(`[Geocoding] Error geocoding "${address}":`, error);
    return null;
  }
}

/**
 * Reverse geocoding - get address from coordinates
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Display name or null if not found
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StayEasy-Booking/1.0 (contact@stayeasy.com)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }

    return null;
  } catch (error) {
    console.error(
      `[Geocoding] Error reverse geocoding "${lat}, ${lon}":`,
      error
    );
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get nearby places using Nominatim's search
 *
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param placeType - Type of places to search (restaurant, atm, etc.)
 * @param radius - Search radius in meters (default 500)
 * @returns Array of nearby places
 */
export async function getNearbyPlaces(
  lat: number,
  lon: number,
  placeType: string,
  radius: number = 500
): Promise<GeocodeResult[]> {
  try {
    const query = `[out:json];node(around:${radius},${lat},${lon})["amenity"="${placeType}"];out body;`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.elements) {
      return [];
    }

    return data.elements
      .slice(0, 10) // Limit to 10 results
      .map((element: any) => ({
        lat: element.lat,
        lon: element.lon,
        displayName: element.tags.name || `${placeType} at ${element.lat}, ${element.lon}`,
        timestamp: Date.now(),
      }));
  } catch (error) {
    console.error(`[Geocoding] Error fetching nearby ${placeType}:`, error);
    return [];
  }
}

/**
 * Clear geocoding cache
 * Useful for testing or periodic cleanup
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
  console.log('[Geocoding] Cache cleared');
}

/**
 * Get cache size for monitoring
 */
export function getCacheSize(): number {
  return geocodeCache.size;
}

/**
 * Validate if a coordinate pair is valid
 */
export function isValidCoordinate(lat: number | undefined, lon: number | undefined): boolean {
  if (lat === undefined || lon === undefined) {
    return false;
  }
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return false;
  }
  if (isNaN(lat) || isNaN(lon)) {
    return false;
  }
  return validateVietnamBounds(lat, lon);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in Next.js
const createIcon = () => {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Default icon
const defaultIcon = createIcon();

// Component to update map center
function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

interface NearbyPlace {
  lat: number;
  lon: number;
  name: string;
  type: string;
}

interface MapProps {
  /** Center latitude */
  lat: number;
  /** Center longitude */
  lng: number;
  /** Zoom level (default 15) */
  zoom?: number;
  /** Address to display in popup */
  address?: string;
  /** Room name */
  roomName?: string;
  /** Show nearby places */
  showNearby?: boolean;
  /** Nearby place types to show */
  nearbyTypes?: ('restaurant' | 'atm' | 'convenience')[];
  /** Additional CSS class */
  className?: string;
  /** Callback when nearby places load */
  onNearbyLoad?: (places: NearbyPlace[]) => void;
}

export default function Map({
  lat,
  lng,
  zoom = 15,
  address,
  roomName,
  showNearby = false,
  nearbyTypes = ['restaurant', 'atm', 'convenience'],
  className = '',
  onNearbyLoad,
}: MapProps) {
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const center: [number, number] = [lat, lng];

  // Fetch nearby places using Overpass API
  const fetchNearbyPlaces = useCallback(async (type: string) => {
    setLoadingNearby(true);
    try {
      const overpassQuery = `[out:json];
        node(around:500,${lat},${lng})["amenity"="${type}"];
        out body;`;
      const encodedQuery = encodeURIComponent(overpassQuery);
      const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      const places: NearbyPlace[] = data.elements
        .slice(0, 5)
        .map((el: any) => ({
          lat: el.lat,
          lon: el.lon,
          name: el.tags.name || `${type} nearby`,
          type,
        }));

      setNearbyPlaces(places);
      onNearbyLoad?.(places);
    } catch (error) {
      console.error(`Error fetching nearby ${type}:`, error);
      setNearbyPlaces([]);
    } finally {
      setLoadingNearby(false);
    }
  }, [lat, lng, onNearbyLoad]);

  // Load nearby places when category is selected
  useEffect(() => {
    if (activeCategory && showNearby) {
      fetchNearbyPlaces(activeCategory);
    }
  }, [activeCategory, showNearby, fetchNearbyPlaces]);

  // Category translations
  const categoryLabels: Record<string, string> = {
    restaurant: 'Nhà hàng',
    atm: 'ATM',
    convenience: 'Tiện lợi',
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        className="rounded-xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={center} zoom={zoom} />

        {/* Main marker for room */}
        <Marker position={center} icon={defaultIcon}>
          {address && (
            <Popup>
              <div className="text-center">
                {roomName && <strong className="block mb-1">{roomName}</strong>}
                {address}
              </div>
            </Popup>
          )}
        </Marker>

        {/* Nearby place markers */}
        {nearbyPlaces.map((place, index) => (
          <Marker
            key={`${place.type}-${index}`}
            position={[place.lat, place.lon]}
            icon={L.divIcon({
              className: 'custom-nearby-marker',
              html: `<div class="bg-white rounded-full p-1 shadow-lg text-sm">${place.type[0].toUpperCase()}</div>`,
              iconSize: [24, 24],
            })}
          >
            <Popup>{place.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Nearby places controls */}
      {showNearby && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
          <p className="text-xs font-bold mb-2 px-2">Địa điểm lân cận</p>
          <div className="flex flex-col gap-1">
            {nearbyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveCategory(activeCategory === type ? null : type)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  activeCategory === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[type] || type}
              </button>
            ))}
          </div>
          {loadingNearby && (
            <div className="text-xs text-gray-500 mt-2 px-2">
              Đang tải...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

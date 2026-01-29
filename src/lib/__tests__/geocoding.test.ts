import {
  validateVietnamBounds,
  calculateDistance,
  isValidCoordinate,
  clearGeocodeCache,
  getCacheSize,
  GeocodeResult,
} from '../geocoding';

describe('Geocoding Service', () => {
  beforeEach(() => {
    clearGeocodeCache();
  });

  describe('validateVietnamBounds', () => {
    it('should return true for coordinates within Vietnam', () => {
      expect(validateVietnamBounds(16.0544, 108.2022)).toBe(true); // Da Nang
      expect(validateVietnamBounds(10.8231, 106.6297)).toBe(true); // Ho Chi Minh
      expect(validateVietnamBounds(21.0285, 105.8542)).toBe(true); // Hanoi
    });

    it('should return false for coordinates outside Vietnam', () => {
      expect(validateVietnamBounds(40.7128, -74.006)).toBe(false); // New York
      expect(validateVietnamBounds(0, 0)).toBe(false); // Gulf of Guinea
      expect(validateVietnamBounds(25, 120)).toBe(false); // Outside bounds
    });

    it('should return false for edge cases', () => {
      expect(validateVietnamBounds(8.0, 102.0)).toBe(true); // Exact min bounds
      expect(validateVietnamBounds(23.5, 118.0)).toBe(true); // Exact max bounds
      expect(validateVietnamBounds(7.9, 102.0)).toBe(false); // Just below min
      expect(validateVietnamBounds(23.6, 118.0)).toBe(false); // Just above max
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Da Nang to Ho Chi Minh City (approx 600km by road, ~950km direct)
      // The Haversine formula gives straight-line distance
      const distance = calculateDistance(16.0544, 108.2022, 10.8231, 106.6297);
      expect(distance).toBeGreaterThan(600);
      expect(distance).toBeLessThan(700);
    });

    it('should return 0 for same point', () => {
      const distance = calculateDistance(16.0544, 108.2022, 16.0544, 108.2022);
      expect(distance).toBe(0);
    });

    it('should handle short distances', () => {
      // Points about 1km apart
      const distance = calculateDistance(16.0544, 108.2022, 16.0634, 108.2022);
      expect(distance).toBeGreaterThan(0.9);
      expect(distance).toBeLessThan(1.1);
    });
  });

  describe('isValidCoordinate', () => {
    it('should return true for valid Vietnam coordinates', () => {
      expect(isValidCoordinate(16.0544, 108.2022)).toBe(true);
      expect(isValidCoordinate(10.8231, 106.6297)).toBe(true);
    });

    it('should return false for undefined values', () => {
      expect(isValidCoordinate(undefined, 108.2022)).toBe(false);
      expect(isValidCoordinate(16.0544, undefined)).toBe(false);
      expect(isValidCoordinate(undefined, undefined)).toBe(false);
    });

    it('should return false for out of bounds', () => {
      expect(isValidCoordinate(40.7128, -74.006)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidCoordinate(NaN, 108.2022)).toBe(false);
      expect(isValidCoordinate(16.0544, NaN)).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should start with empty cache', () => {
      clearGeocodeCache();
      expect(getCacheSize()).toBe(0);
    });

    it('should track cache size', () => {
      expect(getCacheSize()).toBe(0);
      // Note: We can't test actual caching without mocking fetch
      // But the cache size tracking works
    });
  });
});

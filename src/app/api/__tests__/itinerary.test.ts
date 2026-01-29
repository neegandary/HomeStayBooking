/**
 * Unit tests for /api/itinerary endpoint
 * Tests core validation logic and prompt configuration
 */

import { ITINERARY_SYSTEM_PROMPT, VIBE_LABELS, ItineraryInput } from '@/lib/itinerary-prompt';

describe('itinerary-prompt.ts', () => {
  describe('ITINERARY_SYSTEM_PROMPT', () => {
    it('should contain Da Lat expertise references', () => {
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Đà Lạt');
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Thổ địa');
    });

    it('should contain time-based scheduling rules', () => {
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Sáng sớm');
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Buổi sáng');
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Trưa');
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Chiều');
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Tối');
    });

    it('should contain local place recommendations', () => {
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Bánh căn');
      expect(ITINERARY_SYSTEM_PROMPT).toContain('Thác Datanla');
      expect(ITINERARY_SYSTEM_PROMPT).toContain('hồ Xuân Hương');
    });

    it('should require JSON response', () => {
      expect(ITINERARY_SYSTEM_PROMPT).toContain('JSON');
    });
  });

  describe('VIBE_LABELS', () => {
    it('should have all required vibes', () => {
      expect(VIBE_LABELS).toHaveProperty('relaxing');
      expect(VIBE_LABELS).toHaveProperty('adventurous');
      expect(VIBE_LABELS).toHaveProperty('romantic');
      expect(VIBE_LABELS).toHaveProperty('foodie');
      expect(VIBE_LABELS).toHaveProperty('nature');
      expect(VIBE_LABELS).toHaveProperty('mixed');
    });

    it('should have Vietnamese labels', () => {
      expect(VIBE_LABELS.relaxing).toBe('Thư giãn');
      expect(VIBE_LABELS.foodie).toBe('Ẩm thực');
      expect(VIBE_LABELS.nature).toBe('Thiên nhiên');
    });
  });

  describe('ItineraryInput type', () => {
    it('should accept valid vibe values', () => {
      const validInput: ItineraryInput = {
        guestName: 'Test User',
        stayDuration: 3,
        vibe: 'mixed',
      };

      expect(validInput.guestName).toBe('Test User');
      expect(validInput.stayDuration).toBe(3);
      expect(validInput.vibe).toBe('mixed');
    });
  });
});

describe('Input Validation Logic', () => {
  /**
   * Replicates validation logic from route.ts for testing
   */
  function validateInput(body: unknown): { guestName?: string; stayDuration?: number; vibe?: string } {
    const { guestName, stayDuration, vibe } = body as {
      guestName?: unknown;
      stayDuration?: unknown;
      vibe?: unknown;
    };

    if (!guestName || typeof guestName !== 'string' || guestName.trim().length === 0) {
      return {};
    }

    if (!stayDuration || typeof stayDuration !== 'number' || stayDuration < 1 || stayDuration > 14) {
      return { guestName };
    }

    if (!vibe || typeof vibe !== 'string') {
      return { guestName, stayDuration };
    }

    return { guestName, stayDuration, vibe };
  }

  describe('validateInput function', () => {
    it('should reject missing guestName', () => {
      const result = validateInput({ stayDuration: 2, vibe: 'mixed' });
      expect(result.guestName).toBeUndefined();
    });

    it('should reject empty guestName', () => {
      const result = validateInput({ guestName: '', stayDuration: 2, vibe: 'mixed' });
      expect(result.guestName).toBeUndefined();
    });

    it('should reject stayDuration < 1', () => {
      const result = validateInput({ guestName: 'Test', stayDuration: 0, vibe: 'mixed' });
      expect(result.stayDuration).toBeUndefined();
    });

    it('should reject stayDuration > 14', () => {
      const result = validateInput({ guestName: 'Test', stayDuration: 15, vibe: 'mixed' });
      expect(result.stayDuration).toBeUndefined();
    });

    it('should reject non-numeric stayDuration', () => {
      const result = validateInput({ guestName: 'Test', stayDuration: 'two', vibe: 'mixed' });
      expect(result.stayDuration).toBeUndefined();
    });

    it('should reject missing vibe', () => {
      const result = validateInput({ guestName: 'Test', stayDuration: 2 });
      expect(result.vibe).toBeUndefined();
    });

    it('should accept valid input', () => {
      const result = validateInput({ guestName: 'Test', stayDuration: 3, vibe: 'adventurous' });
      expect(result.guestName).toBe('Test');
      expect(result.stayDuration).toBe(3);
      expect(result.vibe).toBe('adventurous');
    });

    it('should accept maximum stayDuration', () => {
      const result = validateInput({ guestName: 'Test', stayDuration: 14, vibe: 'relaxing' });
      expect(result.stayDuration).toBe(14);
    });

    it('should accept minimum stayDuration', () => {
      const result = validateInput({ guestName: 'Test', stayDuration: 1, vibe: 'romantic' });
      expect(result.stayDuration).toBe(1);
    });
  });
});

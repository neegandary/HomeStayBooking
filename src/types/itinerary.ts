/**
 * Type definitions for AI Itinerary feature
 */

/**
 * Individual activity within an itinerary day
 */
export interface ItineraryActivity {
  /** Time of the activity (e.g., "08:00") */
  time: string;
  /** Name of the activity */
  task: string;
  /** Detailed description */
  desc: string;
  /** Pro tip from local expert */
  pro_tip: string;
}

/**
 * A single day in the itinerary
 */
export interface ItineraryDay {
  /** Day number (1, 2, 3...) */
  day: number;
  /** Theme of the day */
  theme: string;
  /** List of activities */
  activities: ItineraryActivity[];
}

/**
 * Full itinerary response from API
 */
export interface ItineraryResponse {
  /** Introduction message */
  intro: string;
  /** Array of daily itineraries */
  days: ItineraryDay[];
  /** Closing message (optional) */
  outro?: string;
}

/**
 * Input for generating an itinerary
 */
export interface ItineraryInput {
  /** Guest name for personalization */
  guestName: string;
  /** Number of days staying (1-14) */
  stayDuration: number;
  /** Travel vibe/preference */
  vibe: 'relaxing' | 'adventurous' | 'romantic' | 'foodie' | 'nature' | 'mixed';
  /** Location/homestay address for itinerary optimization */
  location?: string;
}

/**
 * Props for AIItinerary component
 */
export interface AIItineraryProps {
  /** Optional room name for context */
  roomName?: string;
  /** Optional city for context */
  city?: string;
}

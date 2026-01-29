# AI Itinerary Feature Documentation

> Last updated: 2026-01-29

## Overview

The AI Itinerary feature generates personalized travel itineraries for Da Lat using Google's Gemini AI. It provides travelers with tailored day-by-day plans based on their stay duration and travel preferences (vibe). The feature is integrated into the booking page as an alternative tab alongside the standard booking form.

### Key Features

- Personalized itineraries based on guest name, stay duration, and travel vibe
- Vietnamese language support with culturally-aware recommendations
- Da Lat local expert persona ("Thổ địa Đà Lạt")
- 6 travel vibe options: relaxing, adventurous, romantic, foodie, nature, mixed
- Loading skeleton with Da Lat aesthetic (mist theme)
- Error handling with retry functionality
- Regenerate itinerary option

---

## API Endpoint: `/api/itinerary`

### Endpoint Details

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/api/itinerary` |
| Authentication | Required (JWT) |
| Rate Limiting | Inherited from auth middleware |

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Request Body

```typescript
{
  guestName: string;      // Required, non-empty string
  stayDuration: number;   // Required, 1-14 days
  vibe: string;           // Required, one of: relaxing, adventurous, romantic, foodie, nature, mixed
}
```

### Example Request

```bash
curl -X POST https://stayeasy.vn/api/itinerary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "guestName": "Nguyen Van A",
    "stayDuration": 3,
    "vibe": "nature"
  }'
```

### Success Response

```json
{
  "itinerary": {
    "intro": "Chào bạn Nguyễn Văn A!...",
    "days": [
      {
        "day": 1,
        "theme": "Khám phá thiên nhiên",
        "activities": [
          {
            "time": "08:00",
            "task": "Ăn sáng",
            "desc": "Bánh căn Tùng Dinh...",
            "pro_tip": "Đến sớm để tránh đông..."
          }
        ]
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | `Tên khách là bắt buộc` | Missing or empty guest name |
| 400 | `Thời gian ở phải từ 1-14 ngày` | Invalid stay duration |
| 400 | `Vibe là bắt buộc` | Missing vibe parameter |
| 401 | - | Unauthorized (JWT token missing/invalid) |
| 500 | `Cấu hình AI chưa hoàn chỉnh...` | GEMINI_API_KEY not configured |
| 500 | `Không thể tạo lịch trình...` | AI generation failed |

### AI Model Configuration

The API uses `gemini-1.5-flash` model with the following settings:

```typescript
{
  temperature: 0.7,        // Creative but consistent outputs
  maxOutputTokens: 2048,   // Sufficient for multi-day itineraries
  responseMimeType: 'application/json'  // Enforces JSON response
}
```

---

## Component Reference: `AIItinerary`

### Location

```
src/components/itinerary/AIItinerary.tsx
```

### Props Interface

```typescript
interface AIItineraryProps {
  /** Optional room name for context display */
  roomName?: string;
  /** Optional city for context display */
  city?: string;
}
```

### Usage Example

```tsx
import { AIItinerary } from '@/components/itinerary';

export default function MyComponent() {
  return (
    <AIItinerary
      roomName="Villa Đà Lạt"
      city="Đà Lạt"
    />
  );
}
```

### Vibe Options

| Vibe | Label | Description |
|------|-------|-------------|
| `relaxing` | Thư giãn | Spa, cafes, leisurely activities |
| `adventurous` | Phiêu lưu | Outdoor activities, hiking, exploration |
| `romantic` | Lãng mạn | Couples activities, scenic spots |
| `foodie` | Ẩm thực | Local cuisine, food tours |
| `nature` | Thiên nhiên | Parks, waterfalls, gardens |
| `mixed` | Hỗn hợp | Balanced mix of all themes |

### Component States

1. **Loading State**: Displays `AIItinerarySkeleton` with animated placeholders
2. **Error State**: Shows error message with retry button
3. **Form State**: Input form for guest details and preferences
4. **Result State**: Generated itinerary with vertical timeline display

### Timeline Display Features

- Day headers with numbered badges and theme labels
- Activity cards with time, task, description
- Pro tips highlighted in amber boxes
- Regenerate button to create a new itinerary

---

## Skeleton Component: `AIItinerarySkeleton`

### Location

```
src/components/itinerary/AIItinerarySkeleton.tsx
```

### Usage

Automatically displayed by `AIItinerary` during API calls. Can also be used standalone:

```tsx
import AIItinerarySkeleton from '@/components/itinerary/AIItinerarySkeleton';

<AIItinerarySkeleton />
```

---

## Type Definitions

### Location

```
src/types/itinerary.ts
```

### Interfaces

```typescript
interface ItineraryActivity {
  time: string;       // e.g., "08:00"
  task: string;       // Activity name
  desc: string;       // Detailed description
  pro_tip: string;    // Local expert tip
}

interface ItineraryDay {
  day: number;              // Day number (1, 2, 3...)
  theme: string;            // Day theme
  activities: ItineraryActivity[];
}

interface ItineraryResponse {
  intro: string;      // Personalized greeting
  days: ItineraryDay[];
}

interface ItineraryInput {
  guestName: string;
  stayDuration: number;     // 1-14 days
  vibe: 'relaxing' | 'adventurous' | 'romantic' | 'foodie' | 'nature' | 'mixed';
}

interface AIItineraryProps {
  roomName?: string;
  city?: string;
}
```

---

## Environment Variables

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Generative AI API key | Yes |

### Setup Instructions

1. Get an API key from [Google AI Studio](https://aistudio.google.com/)
2. Add the key to your `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Restart the development server

---

## Integration: Booking Page Tab

### Location

```
src/app/(main)/rooms/[id]/book/page.tsx
```

### Implementation

The booking page includes a tab system to switch between the booking form and the AI itinerary generator:

```tsx
'use client';

import { AIItinerary } from '@/components/itinerary';

export default function BookPage({ params }: BookPageProps) {
  const [activeTab, setActiveTab] = useState<'booking' | 'itinerary'>('booking');

  // ... room fetching and form handling code ...

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column */}
        <div className="lg:col-span-7">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'booking'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
              }`}
            >
              <span className="material-symbols-outlined">book_online</span>
              Đặt phòng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('itinerary')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'itinerary'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
              }`}
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Lịch trình AI
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'booking' ? (
            /* Booking form content */
            <BookingForm />
          ) : (
            <AIItinerary
              roomName={room?.name}
              city={room?.city || 'Đà Lạt'}
            />
          )}
        </div>

        {/* Right Column: Price Summary */}
        <div className="lg:col-span-5">
          <PriceSummaryCard />
        </div>
      </div>
    </main>
  );
}
```

### Key Integration Points

1. **State Management**: Use `useState` to track `activeTab`
2. **Room Context**: Pass `room?.name` and `room?.city` to `AIItinerary`
3. **Styling**: Match the primary color scheme for visual consistency
4. **Material Icons**: Use Google Material Symbols for iconography
5. **Responsive Design**: Stack tabs on mobile, inline on desktop

---

## System Prompt

### Location

```
src/lib/itinerary-prompt.ts
```

The AI operates as "Thổ địa Đà Lạt" (Da Lat local expert), providing:

- Friendly, enthusiastic persona
- Weather-aware recommendations (Da Lat's variable weather)
- Authentic vs. tourist-trap distinction
- Time-based activity scheduling (6 time slots per day)
- Local tips and hidden gems

### Prompt Structure

```
Role: Da Lat local expert (Thổ địa Đà Lạt)
Schedule:
  - 6-8h: Breakfast (bánh căn, phở)
  - 8-11h: Outdoor activities
  - 11-14h: Lunch + rest
  - 14-17h: Cafes, villages, attractions
  - 18h+: Dinner, night market, lake

Output: Valid JSON only
```

---

## Known Limitations

1. **Stay Duration**: Currently capped at 7 days in UI, 14 days in API validation
2. **Language**: Output is Vietnamese only
3. **Location**: Geared specifically toward Da Lat destinations
4. **API Key**: Requires valid GEMINI_API_KEY in environment
5. **Authentication**: Requires valid JWT token for API access

---

## Troubleshooting

### "Cấu hình AI chưa hoàn chỉnh"

**Cause**: GEMINI_API_KEY is missing or invalid.

**Solution**:
1. Verify `.env.local` contains `GEMINI_API_KEY`
2. Check API key is valid at [Google AI Studio](https://aistudio.google.com/)
3. Restart development server after changes

### "Không thể tạo lịch trình"

**Cause**: AI service error or timeout.

**Solution**:
1. Check network connectivity
2. Verify Google AI quota limits
3. Try again (regenerate functionality)

### "Tên khách là bắt buộc" (400)

**Cause**: Empty or invalid guest name provided.

**Solution**: Ensure guest name is a non-empty string in the request body.

### Loading indefinitely

**Cause**: CORS or network issues.

**Solution**:
1. Verify API endpoint is accessible
2. Check JWT token is valid and not expired
3. Review browser console for CORS errors

/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withAuth, isAuthenticated } from '@/lib/auth/middleware';
import { ITINERARY_SYSTEM_PROMPT } from '@/lib/itinerary-prompt';

/**
 * AI Itinerary API Route
 *
 * POST /api/itinerary
 * Generates personalized travel itineraries for Da Lat using Gemini AI
 *
 * Requires JWT authentication
 */

// Lazy initialization to handle missing API key gracefully
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Input validation interface
 */
interface ItineraryValidation {
  guestName?: string;
  stayDuration?: number;
  vibe?: string;
  location?: string;
}

/**
 * Validates the itinerary input parameters
 */
function validateInput(body: unknown): ItineraryValidation {
  const { guestName, stayDuration, vibe, location } = body as {
    guestName?: unknown;
    stayDuration?: unknown;
    vibe?: unknown;
    location?: unknown;
  };

  if (!guestName || typeof guestName !== 'string' || guestName.trim().length === 0) {
    return { guestName: undefined };
  }

  if (
    !stayDuration ||
    typeof stayDuration !== 'number' ||
    stayDuration < 1 ||
    stayDuration > 14
  ) {
    return { stayDuration: undefined };
  }

  if (!vibe || typeof vibe !== 'string') {
    return { vibe: undefined };
  }

  // Location is optional, default to 'Đà Lạt'
  const validLocation = typeof location === 'string' && location.trim().length > 0 
    ? location.trim() 
    : 'Đà Lạt';

  return { guestName, stayDuration, vibe, location: validLocation };
}

/**
 * Activity structure for itinerary
 */
interface Activity {
  time: string;
  task: string;
  desc: string;
  tip?: string;
  pro_tip?: string;
}

/**
 * Day structure for itinerary
 */
interface ItineraryDay {
  day: number;
  theme: string;
  activities: Activity[];
}

/**
 * Itinerary response structure
 */
interface ItineraryResponse {
  intro: string;
  days: ItineraryDay[];
  outro?: string;
}

/**
 * Generates a personalized itinerary using Gemini AI
 */
async function generateItinerary(
  guestName: string,
  stayDuration: number,
  vibe: string,
  location: string
): Promise<ItineraryResponse> {
  // Allow model override via environment variable
  // gemini-2.5-flash is the recommended stable model (gemini-pro deprecated)
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const model = getGenAI().getGenerativeModel({ model: modelName });

  const userPrompt = `Tạo lịch trình du lịch Đà Lạt cho khách:
    Tên khách: ${guestName}
    Vị trí Homestay: ${location}
    Số ngày ở: ${stayDuration} ngày
    Vibe: ${vibe}`;

  // Gộp System Prompt và User Prompt làm một để tránh lỗi
  const finalPrompt = `${ITINERARY_SYSTEM_PROMPT}\n\n${userPrompt}`;

  // Use simplified API pattern
  const result = await model.generateContent(finalPrompt);
  let text = result.response.text();

  // Strip markdown code blocks if present (```json ... ```)
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

  try {
    const itinerary = JSON.parse(text) as ItineraryResponse;

    // Helper function to replace {guestName} placeholder in any text
    const replaceGuestName = (str: string | undefined): string | undefined => {
      if (!str) return str;
      return str.replace(/\{guestName\}/gi, guestName);
    };

    // Replace {guestName} in intro/outro
    itinerary.intro = replaceGuestName(itinerary.intro) || '';
    itinerary.outro = replaceGuestName(itinerary.outro);

    // Process days and activities
    if (itinerary.days) {
      itinerary.days.forEach((day) => {
        // Replace in day theme
        day.theme = replaceGuestName(day.theme) || day.theme;

        if (day.activities) {
          day.activities.forEach((activity) => {
            // Replace in activity fields
            activity.task = replaceGuestName(activity.task) || activity.task;
            activity.desc = replaceGuestName(activity.desc) || activity.desc;
            activity.tip = replaceGuestName(activity.tip);
            activity.pro_tip = replaceGuestName(activity.pro_tip);

            // Normalize: convert 'tip' to 'pro_tip' for consistency
            if (activity.tip && !activity.pro_tip) {
              activity.pro_tip = activity.tip;
              delete activity.tip;
            }
          });
        }
      });
    }
    return itinerary;
  } catch (e) {
    console.error("JSON Parse Error:", text);
    throw new Error('AI trả về định dạng không hợp lệ');
  }
}

export async function POST(request: NextRequest) {
  // Step 1: Authenticate request
  const authResult = await withAuth(request);
  if (!isAuthenticated(authResult)) {
    return (authResult as { error: NextResponse }).error;
  }

  try {
    // Step 2: Parse and validate request body
    const body = await request.json();
    const validation = validateInput(body);

    if (validation.guestName === undefined) {
      return NextResponse.json(
        { error: 'Tên khách là bắt buộc' },
        { status: 400 }
      );
    }

    if (validation.stayDuration === undefined) {
      return NextResponse.json(
        { error: 'Thời gian ở phải từ 1-14 ngày' },
        { status: 400 }
      );
    }

    if (validation.vibe === undefined) {
      return NextResponse.json(
        { error: 'Vibe là bắt buộc' },
        { status: 400 }
      );
    }

    // Step 3: Generate itinerary using Gemini AI
    const itinerary = await generateItinerary(
      validation.guestName,
      validation.stayDuration,
      validation.vibe,
      validation.location || 'Đà Lạt'
    );

    // Step 4: Return successful response
    return NextResponse.json({ itinerary });
  } catch (error) {
    console.error('Itinerary generation error:', error);

    // Handle Gemini API key missing
    if (
      error instanceof Error &&
      error.message.includes('API key')
    ) {
      return NextResponse.json(
        { error: 'Cấu hình AI chưa hoàn chỉnh. Vui lòng liên hệ quản trị viên.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Không thể tạo lịch trình. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

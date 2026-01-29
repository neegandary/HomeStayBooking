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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Validates the itinerary input parameters
 */
function validateInput(body: unknown): { guestName?: string; stayDuration?: number; vibe?: string } {
  const { guestName, stayDuration, vibe } = body as {
    guestName?: unknown;
    stayDuration?: unknown;
    vibe?: unknown;
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

  return { guestName, stayDuration, vibe };
}

/**
 * Generates a personalized itinerary using Gemini AI
 */
async function generateItinerary(
  guestName: string,
  stayDuration: number,
  vibe: string
): Promise<{ intro: string; days: Array<{ day: number; theme: string; activities: Array<{ time: string; task: string; desc: string; pro_tip: string }> }> }> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const userPrompt = `Tạo lịch trình du lịch Đà Lạt cho khách:

Tên khách: ${guestName}
Số ngày ở: ${stayDuration} ngày
Vibe: ${vibe}

Hãy trả về JSON theo định dạng sau (KHÔNG có markdown code block):

{
  "intro": "Lời chào thân thiện bằng tiếng Việt, giới thiệu về hành trình",
  "days": [
    {
      "day": 1,
      "theme": "Chủ đề của ngày (ví dụ: Khám phá thiên nhiên)",
      "activities": [
        {
          "time": "08:00",
          "task": "Tên hoạt động",
          "desc": "Mô tả chi tiết hoạt động",
          "pro_tip": "Mẹo từ người địa phương"
        }
      ]
    }
  ]
}

Chỉ trả về JSON, không có gì khác.`;

  const result = await model.generateContent({
    contents: [
      { role: 'user', parts: [{ text: ITINERARY_SYSTEM_PROMPT }] },
      { role: 'user', parts: [{ text: userPrompt }] },
    ],
  });

  const response = await result.response;
  const text = response.text();

  // Parse and validate JSON structure
  const itinerary = JSON.parse(text);

  if (!itinerary.intro || !Array.isArray(itinerary.days)) {
    throw new Error('Invalid response structure from AI');
  }

  return itinerary;
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
      validation.vibe
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

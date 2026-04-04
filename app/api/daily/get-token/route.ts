// API route — generates a Daily.co meeting token.
// A regular token lets users join as a participant.
// An owner token lets Natalie join as the host (can mute/remove people, end the call).

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  // Require a logged-in Supabase session — members only
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Daily.co API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { roomName, isOwner = false } = body;

    if (!roomName) {
      return NextResponse.json({ error: "roomName is required" }, { status: 400 });
    }

    const response = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          // Owner can mute participants, end the meeting, etc.
          is_owner: isOwner,
          // Token expires after 4 hours
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (err) {
    console.error("Daily.co get-token error:", err);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}

// API route — creates a Daily.co room for a live session.
// Called by the admin page when Natalie wants to go live.
// Uses the DAILY_API_KEY (server-side only — never exposed to the browser).

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/require-admin";

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Daily.co API key not configured. Add DAILY_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { name, title } = body;

    // Ask Daily.co to create the room
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // Use the provided name or let Daily.co generate one
        ...(name ? { name } : {}),
        privacy: "public",
        properties: {
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error }, { status: response.status });
    }

    const room = await response.json();

    // Return just the fields we need
    return NextResponse.json({
      name: room.name,
      url: room.url,
      createdAt: room.created_at,
    });
  } catch (err) {
    console.error("Daily.co create-room error:", err);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}

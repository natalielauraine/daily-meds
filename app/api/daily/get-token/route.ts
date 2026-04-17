// API route — generates a Daily.co meeting token.
// A regular token lets users join as a participant.
// An owner token lets Natalie join as the host (can mute/remove people, end the call).
//
// Access is gated: only users with access_level = 2 (Premium / Annual / Lifetime / Trial)
// can join live sessions. Audio-only and free users are denied with an upgrade message.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  // Require a logged-in Supabase session
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check access_level using service role so we can read the users table
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await adminClient
    .from("users")
    .select("access_level, subscription_status")
    .eq("id", user.id)
    .single();

  const accessLevel = profile?.access_level ?? 0;

  // Live sessions require Premium (access_level 2).
  // Audio-only (level 1) and Free (level 0) users are redirected to upgrade.
  if (accessLevel < 2) {
    return NextResponse.json(
      {
        error:   "upgrade_required",
        message: "Live sessions are available on the Premium plan. Upgrade to join.",
        upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com"}/pricing`,
      },
      { status: 403 }
    );
  }

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
        Authorization:  `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner:  isOwner,
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

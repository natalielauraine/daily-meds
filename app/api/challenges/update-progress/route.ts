// Called after a user completes a session.
// Checks all their active challenges and increments progress if the session counts.
//
// Call this from the session player when the user marks a session complete:
//   fetch("/api/challenges/update-progress", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ sessionMinutes: 10, moodCategory: "Anxious" }),
//   });

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  // Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { sessionMinutes = 0, moodCategory = "" } = await req.json();

  // Get user's active (not completed) challenge participations
  const { data: participations } = await supabase
    .from("challenge_participants")
    .select("*, challenges(*)")
    .eq("user_id", user.id)
    .eq("completed", false);

  if (!participations?.length) return NextResponse.json({ updated: [] });

  const updates: string[] = [];

  for (const p of participations) {
    const challenge = (p as Record<string, unknown>).challenges as {
      id: string;
      challenge_type: string;
      target_value: number;
      duration_days: number;
    };

    if (!challenge) continue;

    // Check if the challenge window has expired
    const startedAt = new Date(p.started_at).getTime();
    const expiresAt = startedAt + challenge.duration_days * 24 * 60 * 60 * 1000;
    if (Date.now() > expiresAt) continue; // expired — don't update

    let newProgress = p.progress_value;

    if (challenge.challenge_type === "sessions") {
      // Increment by 1 for any completed session
      newProgress += 1;
    } else if (challenge.challenge_type === "days") {
      // Only increment if the user hasn't already meditated today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayCheck } = await supabase
        .from("challenge_participants")
        .select("id")
        .eq("id", p.id)
        .single();

      // Check user_progress for a completion today
      const { data: todayProgress } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("last_watched", todayStart.toISOString())
        .limit(1)
        .maybeSingle();

      // If this is the FIRST completion today, increment the streak
      if (!todayProgress) {
        newProgress += 1;
      } else {
        // Already meditated today — don't double-count
        continue;
      }
    } else if (challenge.challenge_type === "minutes") {
      // Increment by session duration in minutes
      newProgress += Math.round(sessionMinutes);
    } else if (challenge.challenge_type === "mood") {
      // Count how many unique mood categories the user has tried
      // This requires querying user_progress + sessions table
      const { data: moodData } = await supabase
        .from("user_progress")
        .select("sessions(mood_category)")
        .eq("user_id", user.id)
        .eq("completed", true);

      const moods = new Set<string>();
      (moodData ?? []).forEach((row) => {
        const m = (row.sessions as { mood_category?: string } | null)?.mood_category;
        if (m) moods.add(m);
      });
      // Also include the current session's mood category
      if (moodCategory) moods.add(moodCategory);

      newProgress = moods.size;
    }

    if (newProgress === p.progress_value) continue; // nothing changed

    const isComplete = newProgress >= challenge.target_value;

    await supabase
      .from("challenge_participants")
      .update({
        progress_value: Math.min(newProgress, challenge.target_value),
        completed: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq("id", p.id);

    updates.push(challenge.id);
  }

  return NextResponse.json({ updated: updates });
}

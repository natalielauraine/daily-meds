// Admin-only endpoint — triggers the Going Live email blast.
// Called from the admin live panel. Verifies the request comes from Natalie
// via Supabase session, then forwards to the email route with CRON_SECRET.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  // Verify admin session
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Forward to the going-live email route with the cron secret
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thedailymeds.com";

  let body: Record<string, string> = {};
  try {
    body = await req.json();
  } catch {
    // no body — fine
  }

  const res = await fetch(`${appUrl}/api/email/going-live`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "x-cron-secret": process.env.CRON_SECRET ?? "",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// This route handles the redirect back from Supabase after Google login.
// When a user clicks "Continue with Google", Supabase sends them here after they authenticate.
// We exchange the one-time code for a real session, then send them to the app.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = cookies();

    // Create a Supabase server client that can set cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Send the user to the homepage after successful login
  // (will change to /library once that page is built in Phase 4)
  return NextResponse.redirect(`${origin}/`);
}

// Server-side auth callback handler.
// Handles the PKCE code exchange on the server where cookies (including the
// code verifier) are reliably accessible. This fixes the "PKCE code verifier
// not found in storage" error that occurs with client-side-only handling.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/home";

  // Handle error params from Supabase (e.g. expired tokens)
  const errorParam =
    searchParams.get("error_description") || searchParams.get("error");
  if (errorParam) {
    console.error("Auth callback error from Supabase:", errorParam);
    return NextResponse.redirect(new URL("/login?error=expired", origin));
  }

  const cookieStore = cookies();

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

  // Password reset emails may arrive with token_hash + type=recovery
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "recovery" | "email",
    });

    if (error) {
      console.error("Token verify error:", error.message);
      return NextResponse.redirect(new URL("/login?error=expired", origin));
    }

    const destination = type === "recovery" ? "/reset-password" : next;
    return NextResponse.redirect(new URL(destination, origin));
  }

  // PKCE code exchange — the code verifier cookie is accessible server-side
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback code exchange error:", error.message);
      return NextResponse.redirect(new URL("/login?error=auth", origin));
    }

    // Fire-and-forget pings (don't block the redirect)
    const baseUrl = origin;
    fetch(`${baseUrl}/api/user/ping`, { method: "POST" }).catch(() => {});
    fetch(`${baseUrl}/api/affiliate/auto-enroll`, { method: "POST" }).catch(
      () => {}
    );

    return NextResponse.redirect(new URL(next, origin));
  }

  // No valid auth parameters — send to login
  return NextResponse.redirect(new URL("/login?error=auth", origin));
}

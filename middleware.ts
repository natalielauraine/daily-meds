// Middleware runs on every page request before it reaches the component.
// Its job here is to refresh the user's Supabase session so it doesn't expire
// while they're browsing. It also protects pages that require login.

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // If Supabase isn't configured yet (env vars are empty), just pass through
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  // Start with a plain pass-through response
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: write onto the request so subsequent reads in this middleware see them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: rebuild the response from the mutated request
          supabaseResponse = NextResponse.next({ request });
          // Step 3: write onto the response so the browser receives them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: always call getUser() before any redirect — this refreshes
  // the session token and writes updated cookies via setAll above.
  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = [
    // /session is intentionally NOT here — free sessions are public.
    // Premium gating and signup prompts are handled inside the session page.
    "/library",
    "/profile",
    "/stats",
    "/watchlist",
    "/downloads",
    "/timer",
    "/rooms",
    "/affiliate/dashboard",
    "/admin",
  ];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    // Copy session cookies onto the redirect so they aren't lost
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // Only allowed admins can access /admin routes
  const adminEmails = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
    
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminPath && user && adminEmails.length > 0 && !adminEmails.includes(user.email?.toLowerCase() || "")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Always return supabaseResponse (not a new NextResponse) so session
  // cookies set by getUser() are forwarded to the browser.
  return supabaseResponse;
}

// Tell Next.js which paths to run middleware on.
// Exclude static files, images, and ALL API routes — API routes handle their own auth.
// Running Supabase's getUser() on API requests (especially Stripe webhooks) can
// interfere with raw body reading and cause 307 redirects from Vercel.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

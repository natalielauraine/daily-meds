// requireAdmin — reusable auth guard for all admin API routes.
// Reads the user's Supabase session from cookies and verifies their email
// matches ADMIN_EMAIL. Returns a 401 response if either check fails,
// or null if the caller is allowed to proceed.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const adminEmail = process.env.ADMIN_EMAIL;

  // ADMIN_EMAIL must be set in .env.local — fail safe if it isn't
  if (!adminEmail) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  // Read the Supabase session from the request cookies
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // Verify the session is valid (getUser hits the Supabase auth server — not just the JWT)
  const { data: { user } } = await supabase.auth.getUser();

  // Fail if not logged in, or logged in as a non-admin user
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // All checks passed — caller can proceed
  return null;
}

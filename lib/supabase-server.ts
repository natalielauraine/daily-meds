// Creates a Supabase client for use inside server components and API routes.
// This version reads and writes cookies so the session is kept alive server-side.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies from the request
        getAll() {
          return cookieStore.getAll();
        },
        // Set cookies — not possible in server components, handled by middleware instead
        setAll() {},
      },
    }
  );
}

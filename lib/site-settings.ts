// Site settings helper — reads and writes OG/social sharing settings
// from the Supabase "site_settings" table.
//
// Each row is one page on the site (e.g. "home", "pricing").
// Natalie can edit these from the admin > Social Sharing page.
//
// Table needed in Supabase (run once in SQL editor):
//
//   create table site_settings (
//     id uuid default gen_random_uuid() primary key,
//     page_slug text unique not null,
//     og_title text,
//     og_description text,
//     og_image_url text,
//     updated_at timestamp with time zone default now()
//   );
//
//   -- Let admin read/write, everyone else read only
//   alter table site_settings enable row level security;
//   create policy "Public read" on site_settings for select using (true);
//   create policy "Service role write" on site_settings for all using (true) with check (true);

import { createClient } from "@supabase/supabase-js";

// One entry per page — page_slug is the unique key
export type PageSlug =
  | "home"
  | "pricing"
  | "live"
  | "breathe"
  | "testimonials"
  | "affiliate"
  | "free"
  | "about";

export type SiteSetting = {
  page_slug: PageSlug;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
};

// Default fallback values used when there's no Supabase row yet
export const PAGE_DEFAULTS: Record<PageSlug, { title: string; description: string }> = {
  home:         { title: "Daily Meds — Audio for Emotional Emergencies", description: "Guided meditation and breathwork for life's most awkward moments." },
  pricing:      { title: "Pricing — Daily Meds", description: "Monthly, annual and lifetime plans from £19.99/month." },
  live:         { title: "Live Sessions — Daily Meds", description: "Join Natalie Lauraine live for real-time guided meditation." },
  breathe:      { title: "Breathing Timer — Daily Meds", description: "Box breathing, 4-7-8 and custom patterns." },
  testimonials: { title: "Testimonials — Daily Meds", description: "Real stories from Daily Meds members." },
  affiliate:    { title: "Affiliate Programme — Daily Meds", description: "Earn 20% commission on every referral." },
  free:         { title: "Free Sessions — Daily Meds", description: "Start here. Free guided meditation and breathwork." },
  about:        { title: "About — Daily Meds", description: "Meet Natalie Lauraine, the voice behind Daily Meds." },
};

// Fetch OG settings for a single page — called from layout.tsx server components
export async function getPageSettings(slug: PageSlug): Promise<SiteSetting | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const supabase = createClient(supabaseUrl, anonKey);
  const { data } = await supabase
    .from("site_settings")
    .select("page_slug, og_title, og_description, og_image_url")
    .eq("page_slug", slug)
    .single();

  return data ?? null;
}

// Fetch all pages at once — used by the admin social page
export async function getAllPageSettings(): Promise<SiteSetting[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return [];

  const supabase = createClient(supabaseUrl, anonKey);
  const { data } = await supabase
    .from("site_settings")
    .select("page_slug, og_title, og_description, og_image_url");

  return (data as SiteSetting[]) ?? [];
}

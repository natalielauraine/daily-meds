// OG settings API — GET returns all page settings, POST saves one page's settings.
// Uses service role key so it can write to Supabase bypassing RLS.
// Called from the admin > Social Sharing page.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from("site_settings")
    .select("page_slug, og_title, og_description, og_image_url");

  if (error) return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  return NextResponse.json({ settings: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { page_slug, og_title, og_description, og_image_url } = body;

  if (!page_slug) {
    return NextResponse.json({ error: "page_slug is required" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Upsert — insert if new, update if already exists
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      page_slug,
      og_title:       og_title || null,
      og_description: og_description || null,
      og_image_url:   og_image_url || null,
      updated_at:     new Date().toISOString(),
    }, { onConflict: "page_slug" });

  if (error) return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  return NextResponse.json({ saved: true });
}

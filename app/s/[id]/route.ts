import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ref = request.nextUrl.searchParams.get("r");

  if (ref) {
    const cookieStore = cookies();
    cookieStore.set("dm_ref", ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  const shortId = params.id;
  let sessionUuid = shortId;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("sessions")
      .select("id")
      .eq("short_id", shortId)
      .single();
    if (data) sessionUuid = data.id;
  }

  const destination = new URL(`/session/${sessionUuid}`, request.url);
  destination.searchParams.set("utm_source", "share_card");
  destination.searchParams.set("utm_medium", "social");

  return NextResponse.redirect(destination, 302);
}

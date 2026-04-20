import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createPresignedUploadUrl, r2PublicUrl } from "../../../../lib/r2";

const ALLOWED_TYPES: Record<string, string> = {
  "audio/wav":  "wav",
  "audio/wave": "wav",
  "audio/mpeg": "mp3",
  "audio/mp4":  "m4a",
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType, folder = "audio" } = await req.json();

  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const sanitized = (filename as string)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  const key = `${folder}/${Date.now()}-${sanitized}`;
  const uploadUrl = await createPresignedUploadUrl(key, contentType);
  const publicUrl = r2PublicUrl(key);

  return NextResponse.json({ uploadUrl, publicUrl, key });
}

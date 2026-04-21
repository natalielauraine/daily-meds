import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { r2, r2PublicUrl } from "../../../../lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Allow large audio/image uploads (up to 100 MB)
export const runtime = "nodejs";
export const maxDuration = 60; // seconds

// Next.js 14+ route segment config for body size
export const fetchCache = "default-no-store";

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "dailymeds";

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
  // ── Auth check ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const adminEmails = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  if (!user || !adminEmails.includes(user.email?.toLowerCase() || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Read the multipart form data ────────────────────────────────────────────
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "audio";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 100 MB)" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  // ── Build the R2 key ────────────────────────────────────────────────────────
  const sanitized = file.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
  const key = `${folder}/${Date.now()}-${sanitized}`;

  // ── Upload directly to R2 from our server ───────────────────────────────────
  const arrayBuffer = await file.arrayBuffer();

  await r2.send(
    new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        Buffer.from(arrayBuffer),
      ContentType: file.type,
    })
  );

  const publicUrl = r2PublicUrl(key);

  return NextResponse.json({ publicUrl, key });
}

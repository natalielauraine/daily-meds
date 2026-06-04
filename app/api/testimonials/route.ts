// /api/testimonials
//
// Public POST endpoint for the testimonials feedback form.
// Body: { name: string, email: string, testimonial: string }
//
// On success:
//   1. Inserts a row into public.testimonials (Supabase) with status 'pending'
//   2. Sends a notification email to Nat at support@thedailymeds.com via Resend
//
// The email send is best-effort — the user gets a success response as long as
// the database insert worked, even if Resend is temporarily unavailable.
//
// Required env vars: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../lib/resend";

export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  let name = "";
  let email = "";
  let testimonial = "";

  try {
    const body = await req.json();
    name = (body.name || "").toString().trim().slice(0, 200);
    email = (body.email || "").toString().trim().toLowerCase().slice(0, 320);
    testimonial = (body.testimonial || "").toString().trim().slice(0, 2000);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  if (!testimonial) {
    return NextResponse.json({ error: "Testimonial text is required" }, { status: 400 });
  }

  // ── 1. Persist to Supabase ──────────────────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: dbError } = await supabase
    .from("testimonials")
    .insert({
      name,
      email,
      testimonial,
      status: "pending",
    });

  if (dbError) {
    console.error("[testimonials] Supabase insert failed:", dbError);
    return NextResponse.json({ error: "Could not save testimonial" }, { status: 500 });
  }

  // ── 2. Notify Nat (best-effort, non-blocking) ──────────────────────────
  try {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTestimonial = escapeHtml(testimonial);

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: "support@thedailymeds.com",
      subject: `New Testimonial from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0e0e0e;color:#ffffff;border-radius:12px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#ff41b3;">New Testimonial</h2>
          <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:14px;">Someone shared their experience with Daily Meds.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;width:80px;vertical-align:top;">Name</td>
              <td style="padding:8px 0;color:#ffffff;font-size:14px;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Email</td>
              <td style="padding:8px 0;color:#ffffff;font-size:14px;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Said</td>
              <td style="padding:8px 0;color:#ffffff;font-size:14px;line-height:1.6;">&ldquo;${safeTestimonial}&rdquo;</td>
            </tr>
          </table>
        </div>
      `,
    });
  } catch (err) {
    console.warn("[testimonials] Notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}

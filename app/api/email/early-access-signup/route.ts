// /api/email/early-access-signup
//
// Public POST endpoint that the /early-access waitlist form submits to.
// Body: { name?: string, email: string, source?: string }
//
// On success:
//   1. Upserts a row into public.early_access_signups (Supabase) — idempotent on email
//   2. Adds the contact to the Resend audience (if RESEND_AUDIENCE_ID is set)
//   3. Sends a notification email to Natalie at nat@wheresnatat.com
//
// Failures in steps 2 or 3 do NOT block step 1. The user-facing response
// is "ok" as long as the database insert succeeded, so the form completes
// even if Resend is temporarily unavailable.
//
// Required env vars: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
// Optional env var:  RESEND_AUDIENCE_ID (skip Resend audience add if absent)
// SQL migration:     scripts/sql/2026-05-17-early-access-signups.sql

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";

export const dynamic = "force-dynamic";

// Tiny HTML-escape to neutralise the user-supplied values in the notification email
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
  let source = "";

  try {
    const body = await req.json();
    name = (body.name || "").toString().trim().slice(0, 200);
    email = (body.email || "").toString().trim().toLowerCase().slice(0, 320);
    source = (body.source || "").toString().trim().slice(0, 80);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Minimal email validation. RFC-compliant validation is server-side rejection territory
  // and a noisy false-positive surface; we let Resend's deliverability layer catch the rest.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent") || null;
  const ipCountry = req.headers.get("x-vercel-ip-country") || null;

  // ── 1. Persist to Supabase ──────────────────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: signup, error: dbError } = await supabase
    .from("early_access_signups")
    .upsert(
      {
        email,
        name: name || null,
        source: source || null,
        user_agent: userAgent,
        ip_country: ipCountry,
      },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (dbError) {
    console.error("[early-access-signup] Supabase insert failed:", dbError);
    return NextResponse.json({ error: "Could not save signup" }, { status: 500 });
  }

  // ── 2. Add to Resend audience (best-effort, non-blocking) ───────────────
  if (process.env.RESEND_AUDIENCE_ID) {
    try {
      const [firstName, ...rest] = name.split(" ");
      await resend.contacts.create({
        audienceId: process.env.RESEND_AUDIENCE_ID,
        email,
        firstName: firstName || undefined,
        lastName: rest.join(" ") || undefined,
        unsubscribed: false,
      });

      await supabase
        .from("early_access_signups")
        .update({ resend_synced: true })
        .eq("id", signup.id);
    } catch (err) {
      // Already-in-audience errors are expected on repeat signups; log and move on.
      console.warn("[early-access-signup] Resend audience add failed:", err);
    }
  }

  // ── 3. Notify Natalie (best-effort, non-blocking) ───────────────────────
  try {
    const safeName = escapeHtml(name || "—");
    const safeEmail = escapeHtml(email);
    const safeSource = escapeHtml(source || "—");

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: "nat@wheresnatat.com",
      subject: `New Early-Access Signup: ${name || email}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0e0e0e;color:#ffffff;border-radius:12px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#aaee20;">New Early-Access Signup</h2>
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:14px;">Someone just joined the list.</p>
          <table style="width:100%;margin-top:24px;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;width:80px;">Name</td>
              <td style="padding:8px 0;color:#ffffff;font-size:14px;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</td>
              <td style="padding:8px 0;color:#ffffff;font-size:14px;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Source</td>
              <td style="padding:8px 0;color:#ffffff;font-size:14px;">${safeSource}</td>
            </tr>
          </table>
        </div>
      `,
    });
  } catch (err) {
    console.warn("[early-access-signup] Notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}

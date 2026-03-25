// Sends an email to the brand when their crew application is approved.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { crewName, contactEmail, inviteCode, crewId } = await req.json();

  if (!contactEmail || !crewName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
  const crewUrl = `${base}/brand-crews/${crewId}`;

  try {
    await resend.emails.send({
      from: "Daily Meds <hello@thedailymeds.com>",
      to: contactEmail,
      subject: `Your Brand Crew is live — ${crewName}`,
      html: `
        <div style="background:#0D0D1A;color:#F0F0F0;font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;border-radius:12px;">
          <div style="margin-bottom:32px;">
            <span style="color:#F43F5E;font-weight:500;">THE </span>
            <span style="color:#F97316;font-weight:500;">DAILY </span>
            <span style="color:#22C55E;font-weight:500;">MEDS</span>
          </div>

          <h1 style="font-size:22px;font-weight:500;margin-bottom:8px;">Your Brand Crew is approved!</h1>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;margin-bottom:32px;">
            Congratulations — <strong style="color:#F0F0F0;">${crewName}</strong> is now a verified brand crew on Daily Meds. Your community can start joining and meditating together right now.
          </p>

          <div style="background:#1A1A2E;border:0.5px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:8px;">Your crew invite code</p>
            <p style="font-size:28px;font-weight:500;letter-spacing:0.3em;font-family:monospace;margin-bottom:8px;">${inviteCode}</p>
            <p style="font-size:12px;color:rgba(255,255,255,0.3);">Share this with your audience so they can join</p>
          </div>

          <a href="${crewUrl}" style="display:block;background:linear-gradient(135deg,#F43F5E,#EC4899,#D946EF,#F97316,#EAB308,#FACC15);color:white;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-size:14px;font-weight:500;margin-bottom:24px;">
            View your brand crew page
          </a>

          <p style="color:rgba(255,255,255,0.3);font-size:12px;line-height:1.6;">
            Share your crew page link with your audience: <br/>
            <span style="color:rgba(255,255,255,0.5);">${crewUrl}</span>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}

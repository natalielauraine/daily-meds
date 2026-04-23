import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL, FROM_NAME } from "../../../../lib/resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let name = "";
  let email = "";

  try {
    const body = await req.json();
    name  = (body.name  || "").trim();
    email = (body.email || "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from:    `${FROM_NAME} <${FROM_EMAIL}>`,
      to:      "nat@wheresnatat.com",
      subject: `New Beta Sign-Up: ${name || email}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0e0e0e;color:#ffffff;border-radius:12px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#aaee20;">New Beta Sign-Up</h2>
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:14px;">Someone just joined the beta list.</p>
          <table style="width:100%;margin-top:24px;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;width:80px;">Name</td>
              <td style="padding:8px 0;color:#ffffff;font-size:14px;">${name || "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</td>
              <td style="padding:8px 0;color:#ffffff;font-size:14px;">${email}</td>
            </tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Beta signup email failed:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

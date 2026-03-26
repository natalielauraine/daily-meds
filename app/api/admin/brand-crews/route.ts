// Admin API — approve or reject a brand crew application.
// Uses the Supabase service role key to bypass RLS.
// Sends an approval email via Resend when a crew is approved.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../../../../lib/require-admin";

// Service role client — bypasses RLS so admin can update any row
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Verify the caller is the admin
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const { crewId, action } = await req.json(); // action: "approve" | "reject"

  if (!crewId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updates =
    action === "approve"
      ? { status: "approved", is_verified: true }
      : { status: "rejected", is_verified: false };

  const { data: crew, error } = await supabaseAdmin
    .from("brand_crews")
    .update(updates)
    .eq("id", crewId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send approval email via the email route
  if (action === "approve" && crew?.contact_email) {
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";
      await fetch(`${base}/api/email/brand-crew-approved`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crewName: crew.name,
          contactEmail: crew.contact_email,
          inviteCode: crew.invite_code,
          crewId: crew.id,
        }),
      });
    } catch {
      // Email failure should not block the approval response
    }
  }

  return NextResponse.json({ success: true, crew });
}

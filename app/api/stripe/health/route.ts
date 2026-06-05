import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stripe_secret_key: process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.slice(0, 7)}...` : "MISSING",
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET ? `${process.env.STRIPE_WEBHOOK_SECRET.slice(0, 10)}...` : "MISSING",
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING",
    service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
    audio_price_id: process.env.NEXT_PUBLIC_STRIPE_AUDIO_PRICE_ID ? "SET" : "MISSING",
    audio_annual_price_id: process.env.NEXT_PUBLIC_STRIPE_AUDIO_ANNUAL_PRICE_ID ? "SET" : "MISSING",
    monthly_price_id: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ? "SET" : "MISSING",
    annual_price_id: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID ? "SET" : "MISSING",
    lifetime_price_id: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID ? "SET" : "MISSING",
    trial_setup_price_id: process.env.NEXT_PUBLIC_STRIPE_TRIAL_SETUP_PRICE_ID ? "SET" : "MISSING",
  });
}

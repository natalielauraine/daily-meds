// Pricing page layout — fetches OG settings from Supabase so Natalie can
// edit the social sharing preview from the admin > Social Sharing page.
import type { Metadata } from "next";
import { getPageSettings, PAGE_DEFAULTS } from "../../lib/site-settings";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getPageSettings("pricing");
  const title       = setting?.og_title       || PAGE_DEFAULTS.pricing.title;
  const description = setting?.og_description || PAGE_DEFAULTS.pricing.description;
  const imageUrl    = setting?.og_image_url   || `${APP_URL}/api/og?title=${encodeURIComponent("Pricing")}&mood=Anxious`;

  return {
    title: "Pricing",
    description,
    openGraph: { title, description, url: `${APP_URL}/pricing`, images: [{ url: imageUrl, width: 1200, height: 630 }] },
    twitter:   { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

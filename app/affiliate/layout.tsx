// Affiliate page layout — fetches OG settings from Supabase so Natalie can
// edit the social sharing preview from the admin > Social Sharing page.
import type { Metadata } from "next";
import { getPageSettings, PAGE_DEFAULTS } from "../../lib/site-settings";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getPageSettings("affiliate");
  const title       = setting?.og_title       || PAGE_DEFAULTS.affiliate.title;
  const description = setting?.og_description || PAGE_DEFAULTS.affiliate.description;
  const imageUrl    = setting?.og_image_url   || `${APP_URL}/api/og?title=${encodeURIComponent("Earn 20% — Affiliate")}&mood=Morning+Reset`;

  return {
    title: "Affiliate Programme",
    description,
    openGraph: { title, description, url: `${APP_URL}/affiliate`, images: [{ url: imageUrl, width: 1200, height: 630 }] },
    twitter:   { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

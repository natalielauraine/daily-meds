// Pricing page layout — sets metadata so search engines and social shares
// show the right title, description and preview image for the pricing page.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free. Upgrade when you're ready. Monthly from £19.99, Annual £199.99, or a one-time Lifetime plan for £299.99.",
  openGraph: {
    title: "Daily Meds Pricing — Start Free, Upgrade Any Time",
    description:
      "Monthly, Annual and Lifetime plans. Full library access, live sessions, group rooms and offline downloads.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

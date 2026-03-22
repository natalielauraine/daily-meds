// Affiliate page layout — metadata for the affiliate programme landing page.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Programme",
  description:
    "Earn 20% commission on every Daily Meds subscription you refer. Monthly, annual and lifetime plans. No cap, no expiry.",
  openGraph: {
    title: "Earn 20% — Daily Meds Affiliate Programme",
    description:
      "Share Daily Meds with your audience and earn 20% on every subscription they take out. Apply in minutes.",
  },
};

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

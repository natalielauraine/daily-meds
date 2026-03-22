// Live page layout — metadata for the live sessions schedule page.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Sessions",
  description:
    "Join Natalie Lauraine live for guided meditation and breathwork sessions. See the schedule and join in real time.",
  openGraph: {
    title: "Live Meditation Sessions — Daily Meds",
    description: "Real-time guided meditation with Natalie Lauraine. Join from anywhere.",
  },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

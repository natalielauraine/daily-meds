// Server component — exports metadata for the breathing timer page.
// The breathe page itself is "use client", so metadata must live here instead.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Breathing Timer",
  description:
    "Guided breathing exercises — box breathing, 4-7-8 and more. Set your duration, pick an ambient sound, and breathe.",
  openGraph: {
    title: "Breathing Timer — Daily Meds",
    description:
      "Box breathing, 4-7-8 and custom patterns. A simple tool for anxiety and calm.",
    url: "https://thedailymeds.com/breathe",
  },
  twitter: {
    title: "Breathing Timer — Daily Meds",
    description: "Box breathing, 4-7-8 and custom patterns. A simple tool for anxiety and calm.",
  },
};

export default function BreatheLayout({ children }: { children: React.ReactNode }) {
  return children;
}

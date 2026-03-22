// Server component — exports metadata for the testimonials page.
// The testimonials page itself is "use client", so metadata must live here instead.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Real stories from Daily Meds members. Meditation that actually works for hangovers, comedowns, anxiety and everything in between.",
  openGraph: {
    title: "Testimonials — Daily Meds",
    description:
      "Real stories from people who meditate for the messy parts of life.",
    url: "https://thedailymeds.com/testimonials",
  },
  twitter: {
    title: "Testimonials — Daily Meds",
    description: "Real stories from people who meditate for the messy parts of life.",
  },
};

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

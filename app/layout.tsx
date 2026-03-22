import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "../lib/player-context";
import { LanguageProvider } from "../lib/language-context";
import MiniPlayer from "./components/MiniPlayer";

// Load Inter font from Google Fonts — latin + arabic subsets for multilingual support
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

// Global site metadata — individual pages can override any of these
export const metadata: Metadata = {
  title: {
    default: "Daily Meds — Audio for Emotional Emergencies",
    template: "%s — Daily Meds",
  },
  description:
    "Guided meditation and breathwork for life's most awkward moments. Hangover? Comedown? Anxiety? Can't sleep? We've got a session for that.",
  keywords: [
    "meditation", "breathwork", "anxiety", "hangover", "sleep", "mental health",
    "guided meditation", "mindfulness", "Daily Meds", "Natalie Lauraine",
  ],
  authors: [{ name: "Natalie Lauraine" }],
  creator: "Natalie Lauraine",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    siteName: "Daily Meds",
    title: "Daily Meds — Audio for Emotional Emergencies",
    description:
      "Guided meditation and breathwork for life's most awkward moments. Not your average wellness app.",
    url: APP_URL,
    images: [
      {
        url: `${APP_URL}/api/og?title=Daily+Meds&mood=Anxious`,
        width: 1200,
        height: 630,
        alt: "Daily Meds — Audio for Emotional Emergencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Meds — Audio for Emotional Emergencies",
    description: "Meditation for life's most awkward moments.",
    images: [`${APP_URL}/api/og?title=Daily+Meds&mood=Anxious`],
    creator: "@thedailymeds",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-site-bg text-text-primary antialiased font-sans">
        {/* LanguageProvider manages the active language and RTL direction */}
        <LanguageProvider>
          {/* PlayerProvider wraps everything so audio persists across page navigation */}
          <PlayerProvider>
            {children}
            {/* MiniPlayer sits outside page content so it stays pinned to the bottom */}
            <MiniPlayer />
          </PlayerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Space_Grotesk, Lexend, Manrope } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "../lib/player-context";
import { LanguageProvider } from "../lib/language-context";
import { PresenceProvider } from "../lib/presence-context";
import MiniPlayer from "./components/MiniPlayer";
import PlayerSpacer from "./components/PlayerSpacer";
import EmojiReactionToast from "./components/EmojiReactionToast";

// Lexend — DESIGN.md headline font. All uppercase editorial titles.
const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-lexend",
  display: "swap",
});

// Manrope — DESIGN.md body font. Descriptions, labels, metadata.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// Plus Jakarta Sans — kept for backwards compatibility
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// Space Grotesk — kept for backwards compatibility
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Inter — body copy, descriptions, form fields
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
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
    <html
      lang="en"
      className={`${lexend.variable} ${manrope.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="bg-site-bg text-text-primary antialiased font-sans">
        {/* LanguageProvider manages the active language and RTL direction */}
        <LanguageProvider>
          {/* PresenceProvider tracks who is meditating and handles emoji reactions */}
          <PresenceProvider>
            {/* PlayerProvider wraps everything so audio persists across page navigation */}
            <PlayerProvider>
              {children}
              {/* Spacer pushes page content up so it's not hidden behind the mini player */}
              <PlayerSpacer />
              {/* MiniPlayer sits outside page content so it stays pinned to the bottom */}
              <MiniPlayer />
              {/* EmojiReactionToast shows floating emojis sent by other users */}
              <EmojiReactionToast />
            </PlayerProvider>
          </PresenceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

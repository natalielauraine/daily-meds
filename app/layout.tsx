import type { Metadata } from "next";
import { Lexend, Manrope, Epilogue } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "../lib/player-context";
import { LanguageProvider } from "../lib/language-context";
import { PresenceProvider } from "../lib/presence-context";
import MiniPlayer from "./components/MiniPlayer";
import PlayerSpacer from "./components/PlayerSpacer";
import EmojiReactionToast from "./components/EmojiReactionToast";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-lexend",
  display: "swap",
});

// Epilogue — the new Velvet Hour headline font
const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-epilogue",
  display: "swap",
});

// Manrope — DESIGN.md body font. Descriptions, labels, metadata.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
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

  // PWA manifest + theme
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#131313" },
    { media: "(prefers-color-scheme: light)", color: "#131313" },
  ],

  // iOS home screen behaviour
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Daily Meds",
    startupImage: [
      { url: "/icons/splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/icons/splash-1668x2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/icons/splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/icons/splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
    ],
  },

  // Viewport — prevent zoom on input focus (important for mobile audio player)
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },

  // App store / install metadata
  applicationName: "Daily Meds",
  formatDetection: { telephone: false },

  openGraph: {
    type: "website",
    siteName: "Daily Meds",
    title: "Daily Meds — Audio for Emotional Emergencies",
    description:
      "Guided meditation and breathwork for life's most awkward moments. Not your average wellness app.",
    url: APP_URL,
    images: [
      {
        url: `${APP_URL}/api/og?title=Daily+Meds&description=Audio+for+Emotional+Emergencies&mood=Anxious`,
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
      className={`${lexend.variable} ${manrope.variable} ${epilogue.variable} dark`}
    >
      <head>
        {/* Apple touch icon — required for iOS "Add to Home Screen" */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        {/* Explicit favicon links for cross-browser support */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .text-glow-primary { text-shadow: 0 0 12px rgba(255, 65, 142, 0.4); }
          /* Prevent horizontal overflow site-wide */
          html, body { overflow-x: hidden; max-width: 100vw; }
          /* Minimum tap target size for all interactive elements */
          button, a, [role="button"] { min-height: 44px; min-width: 44px; }
          /* Safe area padding for notched devices */
          .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
          .safe-top { padding-top: env(safe-area-inset-top); }
        `}} />
      </head>
      <body className="bg-background text-on-background antialiased font-body">
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

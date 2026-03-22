import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "../lib/player-context";
import MiniPlayer from "./components/MiniPlayer";

// Load Inter font from Google Fonts
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Daily Meds — Audio for Emotional Emergencies",
  description: "Guided meditation and breathwork for life's most awkward moments. Not your average wellness app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-site-bg text-text-primary antialiased font-sans">
        {/* PlayerProvider wraps everything so audio persists across page navigation */}
        <PlayerProvider>
          {children}
          {/* MiniPlayer sits outside page content so it stays pinned to the bottom */}
          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}

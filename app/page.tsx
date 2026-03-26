import type { Metadata } from "next";
import { getPageSettings, PAGE_DEFAULTS } from "../lib/site-settings";
import dynamic from "next/dynamic";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import MoodCategorySection from "./components/MoodCategorySection";
import ContentRow from "./components/ContentRow";
import FriendsActivityFeed from "./components/FriendsActivityFeed";
import { type Session } from "./components/SessionCard";

// Load ReferralTracker only on the client — it uses useSearchParams which
// cannot run on the server, and causes hydration errors if server-rendered
const ReferralTracker = dynamic(() => import("./components/ReferralTracker"), { ssr: false });

// Load ContinueWatchingRow client-only — it fetches from Supabase and is only shown to logged-in users
const ContinueWatchingRow = dynamic(() => import("./components/ContinueWatchingRow"), { ssr: false });

// Load WhoIsOnline client-only — uses Supabase realtime presence (cannot run on server)
const WhoIsOnline = dynamic(() => import("./components/WhoIsOnline"), { ssr: false });

// ── PLACEHOLDER SESSIONS ──────────────────────────────────────────────────────
// These are mock sessions until real content is added in the admin panel.
// Each has a gradient thumbnail using the mood's brand colours from CLAUDE.md.

const FEATURED_SESSIONS: Session[] = [
  {
    id: "f1",
    title: "Hungover & Overwhelmed",
    description: "A gentle reset for when your body and mind are paying the price.",
    duration: "18 min",
    type: "Guided Meditation",
    moodCategory: "Hungover",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 40%, #22D3EE 100%)",
    glowColor: "#8B3CF7",
    isFree: false,
  },
  {
    id: "f2",
    title: "Anxious at 3am",
    description: "Slow your nervous system down. No fluff, just calm.",
    duration: "12 min",
    type: "Breathwork",
    moodCategory: "Anxious",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)",
    glowColor: "#F43F5E",
    isFree: false,
  },
  {
    id: "f3",
    title: "After The Party",
    description: "Come back to yourself after a big night out.",
    duration: "22 min",
    type: "Guided Meditation",
    moodCategory: "After The Sesh",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #FACC15 100%)",
    glowColor: "#F43F5E",
    isFree: false,
  },
  {
    id: "f4",
    title: "Can't Switch Off",
    description: "For the nights your brain just won't stop.",
    duration: "30 min",
    type: "Sleep Audio",
    moodCategory: "Can't Sleep",
    gradient: "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)",
    glowColor: "#8B3CF7",
    isFree: false,
  },
  {
    id: "f5",
    title: "The Comedown Reset",
    description: "Grounding and steady. One breath at a time.",
    duration: "25 min",
    type: "Guided Meditation",
    moodCategory: "On A Comedown",
    gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)",
    glowColor: "#22C55E",
    isFree: false,
  },
  {
    id: "f6",
    title: "Heartbreak at Midnight",
    description: "Feel it. Sit with it. Then let it move through you.",
    duration: "20 min",
    type: "Guided Meditation",
    moodCategory: "Heartbroken",
    gradient: "linear-gradient(135deg, #EC4899 0%, #D946EF 100%)",
    glowColor: "#EC4899",
    isFree: false,
  },
  {
    id: "f7",
    title: "Morning Reset",
    description: "A gentle start before the day takes over.",
    duration: "10 min",
    type: "Breathwork",
    moodCategory: "Morning Reset",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 60%, #FACC15 100%)",
    glowColor: "#F97316",
    isFree: false,
  },
  {
    id: "f8",
    title: "Empty Inside",
    description: "For when you feel hollow and can't explain why.",
    duration: "15 min",
    type: "Guided Meditation",
    moodCategory: "Feeling Empty",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #6366F1 60%, #22D3EE 100%)",
    glowColor: "#6366F1",
    isFree: false,
  },
];

const FREE_SESSIONS: Session[] = [
  {
    id: "free1",
    title: "Box Breathing Basics",
    description: "The simplest tool for anxiety. Four counts in, four out.",
    duration: "8 min",
    type: "Breathwork",
    moodCategory: "Anxious",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)",
    glowColor: "#F43F5E",
    isFree: true,
  },
  {
    id: "free2",
    title: "Five Minute Grounding",
    description: "Quick reset. No setup needed. Works anywhere.",
    duration: "5 min",
    type: "Guided Meditation",
    moodCategory: "Overwhelmed",
    gradient: "linear-gradient(135deg, #F97316 0%, #FACC15 100%)",
    glowColor: "#F97316",
    isFree: true,
  },
  {
    id: "free3",
    title: "Low Energy Lift",
    description: "Gentle energy without the pressure to perform.",
    duration: "10 min",
    type: "Guided Meditation",
    moodCategory: "Low Energy",
    gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 100%)",
    glowColor: "#10B981",
    isFree: true,
  },
  {
    id: "free4",
    title: "Deep Sleep Drop",
    description: "Drift off faster. No counting sheep required.",
    duration: "20 min",
    type: "Sleep Audio",
    moodCategory: "Can't Sleep",
    gradient: "linear-gradient(135deg, #8B3CF7 0%, #6366F1 100%)",
    glowColor: "#8B3CF7",
    isFree: true,
  },
  {
    id: "free5",
    title: "Focus in 7",
    description: "Seven minutes to quiet the noise and go deep.",
    duration: "7 min",
    type: "Breathwork",
    moodCategory: "Focus Mode",
    gradient: "linear-gradient(135deg, #6B21E8 0%, #6366F1 100%)",
    glowColor: "#6B21E8",
    isFree: true,
  },
  {
    id: "free6",
    title: "Morning Check-In",
    description: "Start the day before the day starts you.",
    duration: "6 min",
    type: "Guided Meditation",
    moodCategory: "Morning Reset",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #F97316 60%, #FACC15 100%)",
    glowColor: "#F97316",
    isFree: true,
  },
];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thedailymeds.com";

// Per-page metadata — pulls from Supabase site_settings so Natalie can edit
// the social sharing preview from the admin > Social Sharing page.
export async function generateMetadata(): Promise<Metadata> {
  const setting = await getPageSettings("home");
  const title       = setting?.og_title       || PAGE_DEFAULTS.home.title;
  const description = setting?.og_description || PAGE_DEFAULTS.home.description;
  const imageUrl    = setting?.og_image_url   || `${APP_URL}/api/og?title=Daily+Meds&mood=Anxious`;

  return {
    title: "Daily Meds — Audio for Emotional Emergencies",
    description,
    openGraph: { title, description, url: APP_URL, images: [{ url: imageUrl, width: 1200, height: 630 }] },
    twitter:   { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

// Phase 2 homepage — cinematic hero + mood categories + content rows
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D1A]">
      {/* Tracks ?ref= in the URL and fires affiliate click tracking — renders nothing visible */}
      <ReferralTracker />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MoodCategorySection />

        {/* Thin divider between mood section and content rows */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Continue Watching — only visible to logged-in users with in-progress sessions */}
        <ContinueWatchingRow />

        <ContentRow
          title="Featured Sessions"
          seeAllHref="/library"
          sessions={FEATURED_SESSIONS}
        />

        <ContentRow
          title="Free Sessions — Start Here"
          seeAllHref="/free"
          sessions={FREE_SESSIONS}
        />

        {/* Who's Online Now — shows users currently meditating with emoji reactions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <p className="text-xs text-white/30 uppercase tracking-wide mb-3">Live Now</p>
          <WhoIsOnline />
        </div>

        {/* Friends activity feed */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FriendsActivityFeed limit={4} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

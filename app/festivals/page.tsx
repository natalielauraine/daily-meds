// Festival showcase page — pitch deck / partner-facing page for The Daily Meds at festivals.
// Drop your hero image at /public/festival-hero.jpg to replace the gradient placeholder.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Festivals — The Daily Meds",
  description: "Bringing mindfulness to the festival experience. Meet the team and see The Daily Meds in action.",
};

// ── DATA ─────────────────────────────────────────────────────────────────────

const TEAM = [
  {
    name: "Natalie Lauraine",
    role: "Founder & Creative Director",
    bio: "The vision behind The Daily Meds. Natalie created the concept and leads the creative direction, content, and experience design.",
    initial: "N",
    gradient: "linear-gradient(135deg, #ff41b3, #ec723d)",
    photo: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/natalie-lauraine-daily-meds-founder.jpg",
  },
  {
    name: "Joe Crossley",
    role: "[Role]",
    bio: "[Short description of what this person brings to the festival experience. Keep it punchy — one or two sentences.]",
    initial: "J",
    gradient: "linear-gradient(135deg, #ec723d, #f4e71d)",
    photo: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Joe%20Crossley.png",
  },
  {
    name: "Sarah Main",
    role: "[Role]",
    bio: "[Short description of what this person brings to the festival experience. Keep it punchy — one or two sentences.]",
    initial: "S",
    gradient: "linear-gradient(135deg, #aaee20, #3b82f6)",
    photo: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/Sarah.jpeg",
  },
  {
    name: "[Team Member 4]",
    role: "[Role]",
    bio: "[Short description of what this person brings to the festival experience. Keep it punchy — one or two sentences.]",
    initial: "4",
    gradient: "linear-gradient(135deg, #3b82f6, #ff41b3)",
    photo: "",
  },
];

const REQUIREMENTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
    title: "Space",
    detail: "A dedicated area of [X sqm] — ideally quiet or semi-sheltered, away from main stage noise.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    ),
    title: "Power",
    detail: "2 x standard 13A sockets for audio equipment, lighting, and screens.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 10.38 9.5 9s1.12-2.5 2.5-2.5zM20 18H4v-.57c0-2 4-3.18 8-3.18s8 1.19 8 3.18V18z"/>
      </svg>
    ),
    title: "Staffing",
    detail: "We bring our own team of [X] people. No additional staffing required from the festival.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    ),
    title: "Audio",
    detail: "Optional: access to a PA or speaker system. We can also provide our own portable setup.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
    title: "Wi-Fi or 4G",
    detail: "Basic internet access for running live sessions and the in-app experience.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
      </svg>
    ),
    title: "Schedule Slot",
    detail: "We run [X] sessions per day, [X] minutes each. We work around your programming.",
  },
];

const VIDEOS = [
  {
    label: "Previous Activations",
    description: "Arcadia Stage at Glastonbury Festival",
    youtubeId: "1G_IzArJtec",
    imageUrl: "",
  },
  {
    label: "The Concept",
    description: "What The Daily Meds is, who it's for, and why it works at festivals.",
    youtubeId: "",
    imageUrl: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/natalie-lauraine-daily-meds-founder.jpg",
  },
  {
    label: "Festival Highlights",
    description: "Real moments from previous activations and events.",
    youtubeId: "",
    imageUrl: "",
  },
];

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="text-xs text-white/30 mb-3 uppercase tracking-widest"
      style={{ fontWeight: 500 }}
    >
      {children}
    </p>
  );
}

function TeamCard({ member }: { member: typeof TEAM[number] }) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-2xl"
      style={{ backgroundColor: "#1a1a1a", border: "0.5px solid rgba(255,255,255,0.08)" }}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-2xl text-white shrink-0"
        style={{
          background: member.photo ? undefined : member.gradient,
          fontFamily: "var(--font-lexend)",
          fontWeight: 900,
        }}
      >
        {member.photo ? (
          <Image src={member.photo} alt={member.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
        ) : (
          member.initial
        )}
      </div>
      <div>
        <h3
          className="text-white text-base uppercase mb-0.5"
          style={{ fontFamily: "var(--font-lexend)", fontWeight: 800 }}
        >
          {member.name}
        </h3>
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
        >
          {member.role}
        </p>
        <p className="text-sm text-white/50 leading-relaxed">{member.bio}</p>
      </div>
    </div>
  );
}

function VideoPlaceholder({ video }: { video: typeof VIDEOS[number] }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: "16/9", backgroundColor: "#111" }}
      >
        {video.youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}`}
            title={video.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
          />
        ) : video.imageUrl ? (
          <Image
            src={video.imageUrl}
            alt={video.label}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          // Placeholder shown until YouTube ID or image is added
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: "1rem" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p className="text-xs text-white/25 uppercase tracking-widest">Video coming soon</p>
          </div>
        )}
      </div>
      <div>
        <p
          className="text-sm text-white uppercase tracking-wide"
          style={{ fontFamily: "var(--font-lexend)", fontWeight: 700 }}
        >
          {video.label}
        </p>
        <p className="text-xs text-white/40 mt-1">{video.description}</p>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function FestivalsPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0e0e0e", color: "#fff", fontFamily: "var(--font-manrope)" }}>
      <Navbar />

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden" style={{ minHeight: "85vh" }}>
          {/* Fallback gradient behind the image */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, #0a0005 0%, #1a0030 40%, #0e0e0e 100%)" }}
          />
          {/* Hero image */}
          <div className="absolute inset-0">
            <Image
              src="/festival-hero.jpg"
              alt="The Daily Meds at festivals"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Gradient overlay for text legibility */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 40%, rgba(14,14,14,0.95) 100%)", zIndex: 1 }}
          />

          {/* Hero content */}
          <div
            className="relative flex flex-col items-center justify-end text-center px-6 pb-20 pt-40"
            style={{ zIndex: 2, minHeight: "85vh" }}
          >
            <span
              className="inline-block text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-lexend)",
              }}
            >
              Festival Partnership
            </span>

            <h1
              className="text-5xl md:text-7xl uppercase max-w-3xl leading-none mb-6"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, letterSpacing: "-0.02em" }}
            >
              Mindfulness
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                meets the crowd.
              </span>
            </h1>

            <p
              className="text-lg md:text-xl max-w-xl leading-relaxed mb-10"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              The Daily Meds brings guided audio experiences to festival spaces — real, raw, human sessions for the moments between the music.
            </p>

            <Link
              href="mailto:joy@thedailymeds.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all hover:scale-105"
              style={{
                background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
                color: "#fff",
                fontFamily: "var(--font-lexend)",
              }}
            >
              Get in touch
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </Link>
          </div>
        </section>

        {/* ── ABOUT THE PROJECT ────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <SectionLabel>About the project</SectionLabel>
            <h2
              className="text-3xl md:text-4xl uppercase mb-8"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
            >
              What we bring to your festival
            </h2>
            <div className="flex flex-col gap-5 text-white/55 leading-relaxed text-base">
              <p>
                The Daily Meds is an audio meditation platform built for real life — the messy, human, sometimes overwhelming parts of it. We create guided sessions for specific feelings: hungover, anxious, heartbroken, overstimulated, raw.
              </p>
              <p>
                At festivals, those feelings are everywhere. Between the highs are the comedowns, the overwhelm, the 3am quiet. We create a space where festivalgoers can pause, reset, and return to the dancefloor feeling human again.
              </p>
              <p>
                Our festival activation is a fully self-contained experience — a sanctuary within your event. We run scheduled group sessions throughout the day, alongside a drop-in space where attendees can access sessions on their phones whenever they need.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                { value: "[X]+", label: "Sessions available" },
                { value: "[X]", label: "Min per session" },
                { value: "[X]+", label: "Moods covered" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-5 rounded-2xl text-center"
                  style={{ backgroundColor: "#1a1a1a", border: "0.5px solid rgba(255,255,255,0.07)" }}
                >
                  <p
                    className="text-3xl text-white mb-1"
                    style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/35 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM ──────────────────────────────────────────────────────── */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: "#0a0a0a", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <div className="max-w-5xl mx-auto">
            <SectionLabel>The team</SectionLabel>
            <h2
              className="text-3xl md:text-4xl uppercase mb-10"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
            >
              Who we are
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEAM.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* ── VIDEOS ────────────────────────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <SectionLabel>See it in action</SectionLabel>
            <h2
              className="text-3xl md:text-4xl uppercase mb-10"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
            >
              Watch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {VIDEOS.map((video) => (
                <VideoPlaceholder key={video.label} video={video} />
              ))}
            </div>
          </div>
        </section>

        {/* ── REQUIREMENTS ─────────────────────────────────────────────── */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: "#0a0a0a", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <div className="max-w-5xl mx-auto">
            <SectionLabel>What we need</SectionLabel>
            <h2
              className="text-3xl md:text-4xl uppercase mb-10"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
            >
              Requirements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REQUIREMENTS.map((req) => (
                <div
                  key={req.title}
                  className="p-6 rounded-2xl flex flex-col gap-3"
                  style={{ backgroundColor: "#161616", border: "0.5px solid rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
                  >
                    {req.icon}
                  </div>
                  <h3
                    className="text-white text-sm uppercase"
                    style={{ fontFamily: "var(--font-lexend)", fontWeight: 800 }}
                  >
                    {req.title}
                  </h3>
                  <p className="text-sm text-white/45 leading-relaxed">{req.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,65,179,0.08) 0%, transparent 60%)" }}
          />
          <div className="relative max-w-xl mx-auto flex flex-col items-center gap-6">
            <h2
              className="text-3xl md:text-5xl uppercase"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900 }}
            >
              Let&apos;s bring this to your event.
            </h2>
            <p className="text-white/45 leading-relaxed">
              We&apos;re booking festivals and events now. Reach out to start a conversation.
            </p>
            <Link
              href="mailto:joy@thedailymeds.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all hover:scale-105"
              style={{
                background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
                color: "#fff",
                fontFamily: "var(--font-lexend)",
              }}
            >
              Email us
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

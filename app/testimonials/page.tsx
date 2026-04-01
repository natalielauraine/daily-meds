import Link from "next/link";
import Logo from "../components/Logo";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Testimonials — Daily Meds",
  description: "Real people. Real shifts. See what Daily Meds has done for thousands of listeners.",
};

const TestimonialsV2 = dynamic(() => import("../../components/ui/testimonial-v2"), { ssr: false });

const COL_1 = [
  {
    quote: "I never thought a 5 minute meditation could change the tone of my entire day. I start every morning here now.",
    name: "Sarah K.",
    role: "Member since 2024",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "The breathwork sessions alone are worth it. I've tried every app and nothing has landed like this.",
    name: "Marcus T.",
    role: "Premium Member",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "Daily Meds feels like it was made for people who've failed at meditation before. It finally clicked for me.",
    name: "Jess L.",
    role: "Member since 2023",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "I listen during my commute and arrive to work feeling like a different person. My team has noticed.",
    name: "Priya M.",
    role: "Premium Member",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "Sleep has been my biggest struggle for years. The sleep sessions here are the only thing that consistently works.",
    name: "Daniel W.",
    role: "Member since 2024",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  },
];

const COL_2 = [
  {
    quote: "The live sessions feel so intimate. Like the host is speaking directly to you. I've cried in the best way.",
    name: "Amara O.",
    role: "Premium Member",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "I was sceptical. I am not a meditation person. I am now a meditation person. That's all.",
    name: "Tom B.",
    role: "Member since 2024",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "The anxiety sessions got me through the hardest month of my career. I came back to them daily.",
    name: "Layla H.",
    role: "Premium Member",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "My therapist actually recommended Daily Meds as a complement to our sessions. That says everything.",
    name: "Oliver R.",
    role: "Member since 2023",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "Short, specific, and always exactly what I needed. How does it always feel like the right one?",
    name: "Nina C.",
    role: "Premium Member",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=80&h=80&fit=crop&crop=face",
  },
];

const COL_3 = [
  {
    quote: "I use the timer before every important meeting. Two minutes and I walk in grounded. Game changer.",
    name: "Ravi S.",
    role: "Member since 2024",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "Three months in and my resting heart rate has dropped. My body is calmer. This is real.",
    name: "Chloe F.",
    role: "Premium Member",
    avatar: "https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "I gave this to my mum. She texts me after every session. That's the review right there.",
    name: "James P.",
    role: "Member since 2023",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "I finally understand what it means to regulate your nervous system. And I can actually do it now.",
    name: "Fatima A.",
    role: "Premium Member",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "The sound design alone is worth it. Every session feels like stepping into a different world.",
    name: "Leo M.",
    role: "Member since 2024",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face",
  },
];

export default function TestimonialsPage() {
  return (
    <div style={{ backgroundColor: "#010101", color: "#ffffff", fontFamily: "var(--font-manrope)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* HEADER */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: "rgba(1,1,1,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <Logo href="/" size="md" />
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-lexend)" }}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-full text-sm font-bold uppercase transition-transform hover:scale-105"
            style={{ backgroundColor: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="py-24 px-6 text-center" style={{ background: "linear-gradient(160deg, #080808 0%, #010101 100%)" }}>
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <span
            className="text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
          >
            Real People
          </span>
          <h1
            className="uppercase leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-nyata), var(--font-lexend)",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
            }}
          >
            Real Shifts
          </h1>
          <p className="text-xl leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.5)" }}>
            Thousands of people have found something here that nothing else could give them. Here&apos;s what they said.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "50K+", label: "Members" },
            { value: "4.9★", label: "Average rating" },
            { value: "2M+", label: "Sessions completed" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", color: "#ff41b3" }}
              >
                {value}
              </span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS COLUMNS */}
      <section className="py-8 pb-24">
        <TestimonialsV2 columns={[COL_1, COL_2, COL_3]} />
      </section>

      {/* CTA */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: "linear-gradient(160deg, #080808 0%, #010101 100%)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          <h2
            className="uppercase leading-none tracking-tight"
            style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Your turn
          </h2>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
            Start with what&apos;s free. No card needed.
          </p>
          <Link
            href="/signup"
            className="px-10 py-4 rounded-full text-base font-bold uppercase tracking-wide transition-all hover:scale-105"
            style={{ backgroundColor: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
          >
            Start Free Today
          </Link>
          <Link href="/free" className="text-sm underline underline-offset-4 transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-lexend)" }}>
            Browse free meditations first
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <div
        className="mx-6 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2rem" }}
      >
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          © {new Date().getFullYear()} I AM Sound Ltd, Trading as Daily Meds.
        </p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>Privacy</Link>
          <Link href="/terms" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>Terms</Link>
          <Link href="/" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>Back to Home</Link>
        </div>
      </div>

    </div>
  );
}

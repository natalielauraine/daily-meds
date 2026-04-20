import Link from "next/link";
import Logo from "../components/Logo";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { createClient } from "../../lib/supabase-server";

export const metadata: Metadata = {
  title: "Testimonials — Daily Meds",
  description: "Real people. Real shifts. See what Daily Meds has done for thousands of listeners.",
};

const TestimonialsV2 = dynamic(() => import("../../components/ui/testimonial-v2"), { ssr: false });

const COL_1 = [
  {
    quote: "A wonderful way to start the morning. Thank you.",
    name: "Vanya Morales",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Thank you for one of the best morning meditations I have ever experienced. You have a gift.",
    name: "Jeff",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "This really hit home for me. I needed this today.",
    name: "AJG",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Pure brilliant and magnificent.",
    name: "Gugu H.",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "I must have been in the flow because I lost track of time. That was wonderful.",
    name: "Ann Elizabeth McCommas",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Wow that's some truth telling I needed to hear. Thank you for this.",
    name: "Michelle",
    role: "Austin, TX",
    avatar: "",
  },
  {
    quote: "This was beautiful!! I love interactive meditations!",
    name: "Dominique Jeffries",
    role: "Daily Meds listener",
    avatar: "",
  },
];

const COL_2 = [
  {
    quote: "Bookmarking! This was fantastic. Thank you.",
    name: "Michelle",
    role: "Austin, TX",
    avatar: "",
  },
  {
    quote: "This is my favorite morning talk. Thank you so very much.",
    name: "Sawondra Simpson",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Insightful, inspiring, wise, loving words. Thank you.",
    name: "Antonio Gimeno Calvo",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Beautiful. I loved this. So different to any other chakra meditation I've done — it actually made me think and reflect.",
    name: "Samantha Wain",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Amazing way to start the day. Thank you.",
    name: "Dee",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Good insight on letting go of relationships and focusing on yourself.",
    name: "Joanie",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Wow thank you Natalie for allowing me to understand my own needs and how to communicate them clearly.",
    name: "Safa Al-Baz",
    role: "Daily Meds listener",
    avatar: "",
  },
];

const COL_3 = [
  {
    quote: "One of the best morning meditations I have done. I feel revived and ready for the day ahead.",
    name: "Ellie Devine",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Wow. This hit home a thousand-fold! What an amazing session.",
    name: "Lesley",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Grateful for your encouraging words — they reached me in a positive and authentic way.",
    name: "Marie",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "This is profound. There is a real sacred element to silence and you articulated that beautifully.",
    name: "Kathy",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "That was the best words that could change one's mind from negative to positive.",
    name: "Starlight",
    role: "Daily Meds listener",
    avatar: "",
  },
  {
    quote: "Your soothing and well paced voice made it easy to listen to and absorb your guidance.",
    name: "Blu Jewel",
    role: "Daily Meds listener",
    avatar: "",
  },
];

export default async function TestimonialsPage() {
  // Fetch approved reviews from Supabase
  const supabase = createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("review_text, reviewer_name, session_tag")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Map DB rows into the card shape the component expects
  type Card = { quote: string; name: string; role: string; avatar: string };
  const mapped: Card[] = (reviews ?? []).map((r) => ({
    quote: r.review_text,
    name: r.reviewer_name,
    role: r.session_tag || "Daily Meds listener",
    avatar: "",
  }));

  // Split into 3 columns round-robin so they fill evenly
  let col1: Card[], col2: Card[], col3: Card[];
  if (mapped.length > 0) {
    col1 = mapped.filter((_, i) => i % 3 === 0);
    col2 = mapped.filter((_, i) => i % 3 === 1);
    col3 = mapped.filter((_, i) => i % 3 === 2);
  } else {
    // Fall back to hardcoded cards if no approved reviews yet
    col1 = COL_1;
    col2 = COL_2;
    col3 = COL_3;
  }

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
        <div className="max-w-3xl mx-auto flex justify-center text-center">
          <div className="flex flex-col gap-1">
            <span
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", color: "#ff41b3" }}
            >
              9,000+
            </span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}>
              five-star reviews on Insight Timer
            </span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS COLUMNS */}
      <section className="py-8 pb-24">
        <TestimonialsV2 columns={[col1, col2, col3]} />
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

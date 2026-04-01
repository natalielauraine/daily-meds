import Link from "next/link";
import Logo from "../components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Daily Meds",
  description: "Our privacy promise to you. Your listening is yours. Your inner world is not our business.",
};

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "#010101", color: "#ffffff", fontFamily: "var(--font-manrope)", minHeight: "100vh" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
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

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: "linear-gradient(160deg, #080808 0%, #010101 100%)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <span className="text-3xl">🤍</span>
          <span
            className="text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
          >
            Privacy
          </span>
          <h1
            className="uppercase leading-none tracking-tight"
            style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
          >
            Our Privacy Promise
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            This is a personal space.<br />We treat it that way.
          </p>
          <p className="text-base leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.4)" }}>
            Daily Meds was created as a place to pause, breathe, and return to yourself. That only works if you feel safe here.
          </p>
        </div>
      </section>

      {/* ── CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 pb-32 flex flex-col gap-1">

        {/* So here's our promise */}
        <div className="py-12 text-center">
          <p
            className="text-lg italic"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
          >
            So here&apos;s our promise to you.
          </p>
        </div>

        {/* Section 1 */}
        <div
          className="p-8 rounded-2xl mb-6"
          style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2
            className="text-2xl uppercase tracking-tight mb-2"
            style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900 }}
          >
            Your listening is yours
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            What you listen to, when you listen, and how you move through this space is private.
          </p>
          <ul className="flex flex-col gap-4">
            {[
              "We do not look at individual listening choices.",
              "No one is watching which meditations you choose.",
              "No one is tracking your emotional moments.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span style={{ color: "#ff41b3", marginTop: "2px", fontSize: "18px", lineHeight: 1 }}>·</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
              </li>
            ))}
          </ul>
          <p
            className="mt-6 text-sm italic"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-lexend)" }}
          >
            Your inner world is not our business.
          </p>
        </div>

        {/* Section 2 */}
        <div
          className="p-8 rounded-2xl mb-6"
          style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2
            className="text-2xl uppercase tracking-tight mb-2"
            style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900 }}
          >
            We measure care, not curiosity
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            To keep the platform healthy, we look only at anonymous, aggregated usage — things like:
          </p>
          <ul className="flex flex-col gap-4">
            {[
              "how often the platform is used overall",
              "how long people spend listening",
              "which meditations are helping the most people in general",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span style={{ color: "#aaee20", marginTop: "2px", fontSize: "18px", lineHeight: 1 }}>·</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
              </li>
            ))}
          </ul>
          <p
            className="mt-6 text-sm"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            This helps us improve the experience without ever identifying you.
          </p>
        </div>

        {/* Section 3 */}
        <div
          className="p-8 rounded-2xl mb-6"
          style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2
            className="text-2xl uppercase tracking-tight mb-2"
            style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900 }}
          >
            Your data is not shared or sold
          </h2>
          <p className="mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
            We do not sell your data.<br />
            We do not trade it.<br />
            We do not allow advertisers to profile you.
          </p>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Your information stays within this ecosystem, used only to:
          </p>
          <ul className="flex flex-col gap-4">
            {[
              "give you access to what you've chosen",
              "support subscriptions and payments securely",
              "make the platform function smoothly",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span style={{ color: "#aaee20", marginTop: "2px", fontSize: "18px", lineHeight: 1 }}>·</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 4 */}
        <div
          className="p-8 rounded-2xl mb-6"
          style={{
            backgroundColor: "#0e0e0e",
            border: "1px solid rgba(255,65,179,0.12)",
            background: "linear-gradient(135deg, rgba(255,65,179,0.04) 0%, rgba(14,14,14,1) 60%)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <h2
              className="text-2xl uppercase tracking-tight"
              style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900 }}
            >
              Shared plans, private journeys
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold uppercase"
              style={{ backgroundColor: "rgba(244,231,29,0.15)", color: "#f4e71d", fontFamily: "var(--font-lexend)" }}
            >
              2026
            </span>
          </div>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            In 2026 we will be launching Duo and Family plans. No one but you can see your audio choices.
          </p>
          <ul className="flex flex-col gap-4">
            {[
              "you share access, not personal listening history",
              "your meditation choices are not visible to other members",
              "billing details remain private to the account holder",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span style={{ color: "#ff41b3", marginTop: "2px", fontSize: "18px", lineHeight: 1 }}>·</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
              </li>
            ))}
          </ul>
          <p
            className="mt-6 text-sm italic"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-lexend)" }}
          >
            Everyone gets their own quiet space.
          </p>
        </div>

        {/* Section 5 */}
        <div
          className="p-8 rounded-2xl mb-6"
          style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2
            className="text-2xl uppercase tracking-tight mb-2"
            style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900 }}
          >
            You stay in control
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>You can:</p>
          <ul className="flex flex-col gap-4">
            {[
              "change your password at any time",
              "manage your account details",
              "leave the platform whenever you choose",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span style={{ color: "#aaee20", marginTop: "2px", fontSize: "18px", lineHeight: 1 }}>·</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
              </li>
            ))}
          </ul>
          <p
            className="mt-6 text-sm"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            And if you ever have a question about your data, we&apos;ll answer it honestly.
          </p>
        </div>

        {/* Section 6 — Built with care */}
        <div
          className="p-8 rounded-2xl mb-6 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(170,238,32,0.04) 0%, rgba(14,14,14,1) 100%)",
            border: "1px solid rgba(170,238,32,0.08)",
          }}
        >
          <h2
            className="text-2xl uppercase tracking-tight mb-6"
            style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900 }}
          >
            Built with care
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
            Daily Meds is created by humans who care deeply about nervous systems, boundaries, and trust. We designed this platform the way we would want to use it ourselves.
          </p>
          <p
            className="text-lg italic"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-lexend)" }}
          >
            Soft, respectful, and private.
          </p>
        </div>

        {/* Closing */}
        <div className="py-12 text-center flex flex-col gap-4">
          <p
            className="text-2xl"
            style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-lexend)", fontWeight: 300 }}
          >
            This is your space.
          </p>
          <p
            className="text-lg"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)", fontStyle: "italic" }}
          >
            We&apos;re just holding it for you.
          </p>
          <span className="text-3xl mt-2">🤍</span>
        </div>

        {/* Questions CTA */}
        <div
          className="p-8 rounded-2xl text-center"
          style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Questions about your data? We&apos;ll answer honestly.
          </p>
          <a
            href="mailto:joy@thedailymeds.com"
            className="inline-block px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all hover:scale-105"
            style={{ backgroundColor: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
          >
            Contact Us
          </a>
        </div>

        {/* Bottom nav */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} I AM Sound Ltd, Trading as Daily Meds.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
              Terms & Conditions
            </Link>
            <Link href="/" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

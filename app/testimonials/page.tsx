"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TestimonialsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, testimonial }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setTestimonial("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div style={{ backgroundColor: "#131313", color: "#ffffff", fontFamily: "var(--font-manrope)", minHeight: "100vh", overflowX: "hidden" }}>

      <Navbar />

      {/* HERO */}
      <section className="py-24 px-6 text-center" style={{ background: "linear-gradient(160deg, #131313 0%, #0e0e0e 100%)" }}>
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <span
            className="text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}
          >
            Early Days
          </span>
          <h1
            className="uppercase leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-epilogue)",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
            }}
          >
            We&apos;d Love Your Feedback
          </h1>
          <p className="text-lg leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.5)" }}>
            We&apos;re early and building something special. If you&apos;ve tried Daily Meds,
            we&apos;d love to hear about your experience.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="py-12 px-6">
        <div className="max-w-lg mx-auto">
          {status === "success" ? (
            <div
              className="rounded-2xl p-10 text-center flex flex-col items-center gap-4"
              style={{ backgroundColor: "#191919", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)" }}
              >
                &#10003;
              </div>
              <h2
                className="text-2xl"
                style={{ fontFamily: "var(--font-epilogue)", fontWeight: 800 }}
              >
                Thank you!
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                Your testimonial means the world to us. We&apos;ll review it shortly.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-sm underline underline-offset-4 transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Submit another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-8 sm:p-10 flex flex-col gap-6"
              style={{ backgroundColor: "#191919", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-manrope)" }}
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  maxLength={200}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:ring-1"
                  style={{
                    backgroundColor: "#131313",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontFamily: "var(--font-manrope)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-manrope)" }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  maxLength={320}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:ring-1"
                  style={{
                    backgroundColor: "#131313",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontFamily: "var(--font-manrope)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="testimonial"
                  className="text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-manrope)" }}
                >
                  Your experience
                </label>
                <textarea
                  id="testimonial"
                  required
                  maxLength={2000}
                  rows={6}
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  placeholder="Tell us about your experience with Daily Meds..."
                  className="rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:ring-1 resize-y"
                  style={{
                    backgroundColor: "#131313",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontFamily: "var(--font-manrope)",
                    minHeight: "140px",
                  }}
                />
              </div>

              {status === "error" && (
                <p className="text-sm" style={{ color: "#ec723d" }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-full py-3.5 text-sm font-bold uppercase tracking-wide transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #ff41b3, #ec723d)",
                  color: "#fff",
                  fontFamily: "var(--font-lexend)",
                }}
              >
                {status === "submitting" ? "Sending..." : "Share Your Experience"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-24 px-6 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          <h2
            className="uppercase leading-none tracking-tight"
            style={{ fontFamily: "var(--font-epilogue)", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Haven&apos;t tried it yet?
          </h2>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
            Start with what&apos;s free. No card needed.
          </p>
          <Link
            href="/early-access"
            className="px-10 py-4 rounded-full text-base font-bold uppercase tracking-wide transition-all hover:scale-105"
            style={{ backgroundColor: "#ff41b3", color: "#fff", fontFamily: "var(--font-lexend)" }}
          >
            Join Waitlist
          </Link>
          <Link href="/free" className="text-sm underline underline-offset-4 transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-lexend)" }}>
            Browse free meditations first
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  );
}

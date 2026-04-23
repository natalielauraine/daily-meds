"use client";

import { useState } from "react";
import Logo from "../components/Logo";

export default function BetaPage() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/email/beta-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        backgroundColor: "#0a0f14",
        backgroundImage: "url('https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "var(--font-manrope)",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />

      {/* Logo */}
      <div className="relative z-10 px-8 pt-8">
        <Logo href="/" size="md" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center px-8 py-16">
        <div className="w-full max-w-[1100px] mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-16">

          {/* Left — copy */}
          <div className="flex-1">
            <p
              className="uppercase tracking-widest mb-4 text-sm"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}
            >
              Coming Soon
            </p>
            <h1
              className="uppercase leading-none mb-6"
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 900,
                fontSize: "clamp(3rem, 9vw, 7rem)",
                color: "#ec723d",
                letterSpacing: "-0.02em",
              }}
            >
              We Go Live<br />May 1st
            </h1>
            <p
              className="mb-4 text-xl italic"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(255,255,255,0.75)" }}
            >
              Join Our Beta Test
            </p>
            <p
              className="text-base leading-relaxed max-w-md"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Be the first to experience a new way of sitting with your emotions.{" "}
              <strong style={{ color: "#ffffff" }}>No spiritual fluff.</strong>{" "}
              Just honest regulation when you need it most.
            </p>
          </div>

          {/* Right — form card */}
          <div
            className="w-full lg:w-[420px] rounded-2xl p-8 flex flex-col gap-6"
            style={{ background: "rgba(20,20,20,0.9)", border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <div>
              <h2
                className="text-2xl uppercase"
                style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, color: "#ffffff" }}
              >
                Stay Honest.
              </h2>
              <p
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}
              >
                Get early access credentials.
              </p>
            </div>

            {status === "done" ? (
              <div className="py-8 text-center">
                <p
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-lexend)", color: "#aaee20" }}
                >
                  You&apos;re on the list.
                </p>
                <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                  We&apos;ll be in touch before May 1st.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-[10px] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-lexend)", color: "rgba(255,255,255,0.4)" }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-b text-sm py-2 outline-none placeholder-[rgba(255,255,255,0.2)] text-white transition-colors focus:border-white"
                    style={{ borderColor: "rgba(255,255,255,0.15)", fontFamily: "var(--font-manrope)" }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-[10px] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-lexend)", color: "rgba(255,255,255,0.4)" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="email@address.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent border-b text-sm py-2 outline-none placeholder-[rgba(255,255,255,0.2)] text-white transition-colors focus:border-white"
                    style={{ borderColor: "rgba(255,255,255,0.15)", fontFamily: "var(--font-manrope)" }}
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs" style={{ color: "#ff6b6b" }}>
                    Something went wrong — please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 rounded-lg text-sm uppercase tracking-widest font-black transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{
                    fontFamily: "var(--font-lexend)",
                    background: "linear-gradient(90deg, #ff41b3, #ec723d)",
                    color: "#ffffff",
                    boxShadow: "0 0 30px rgba(255,65,179,0.3)",
                    cursor: status === "loading" ? "wait" : "pointer",
                  }}
                >
                  {status === "loading" ? "Sending…" : "Notify Me"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

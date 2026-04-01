"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingEmailForm() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/signup?email=${encodeURIComponent(email.trim())}`);
    } else {
      router.push("/signup");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 w-full">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="flex-1 text-white px-6 py-4 rounded-lg focus:outline-none transition-colors"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          borderBottom: "1.5px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
        }}
        onFocus={(e) => (e.target.style.borderBottomColor = "#aaee20")}
        onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.15)")}
      />
      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-10 py-4 rounded-lg font-black uppercase tracking-wider transition-all hover:brightness-110 active:scale-95 shrink-0"
        style={{
          background: "linear-gradient(135deg, #aaee20 0%, #98da00 100%)",
          color: "#1a2600",
          fontFamily: "var(--font-plus-jakarta)",
          fontSize: "13px",
        }}
      >
        Get Started
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
        </svg>
      </button>
    </form>
  );
}

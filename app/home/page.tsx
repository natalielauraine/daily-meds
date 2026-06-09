"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LibraryCard, type LibrarySession } from "../components/LibraryCard";

// ── DATA ─────────────────────────────────────────────────────────────────────

const TRENDING_NOW = [
  { 
    title: "Shadow Work", 
    duration: "12 min", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkdN3RtOiHB1BxqUv8fNGfHz0aQZpd_k9IRhgyG8bgKylf32d0vJletgLN9U7xdxj-_PzToX2P3-3OtAOnOK9ZjUkmk9L2bA772y-CRvHwXjSLzdE70e7Jw7zUkOMf82j-7TVfehHRM-u1zFpkRILX8MZ_ZVFdHOix7xoAy7LAvZH7x8tqiT_0HQkqVOzqrdVQqdXlQaCCHOSbxsOImxh-XPCl943O6FoAHjqqQoMT9oRpwuU19rqFxDnlu2X03ZW-TrARAznq2w" 
  },
  { 
    title: "Digital Detox", 
    duration: "18 min", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXhC0O4LuG0dclLgQaXaiOmtVWOiuMwvjV0QZECyVFgXz_xW6IABi7uaivdibl1m7SgYAiMynAu0s7hKJbLlXGSzKE35qG06_G9OdDuaukiiWW1ylEe6dYHqaePcOoVi8IcqPUr8XSnNRtNnfYH4fmhahMGRUqglqZtunson4ovD8S_2X4tXsDZSXE4lk9S702IFfpICDN_XC1BgwzXl-1ZvL-eCPNtXQl7da2SOmXzrOmQV9vS2AmfRLgrlAeee2-0Z373KAr2A" 
  },
  { 
    title: "Electric Pulse", 
    duration: "08 min", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHxdZ5VzNAibfYpGF1VO6U1g0DQSKdE99IRwdJA5V7FLkvjPxXCxPR3wXSh7JuveH5peyG2tP_kZCg4GwINED3YZMhWs8wUJahKQgvURW0oW7Rb6hOGW8CQ6Iw6ucDbsV6Au0-bkcewsBrz8bYrusKbCeO79GlIRFOJCXQK9d0Dzt0Ai-5XI49W4RFa9rmc76QpVNFe5a6bBLaLiiQj4n-Baguu7YQqDFJrATuVc9l7TtJvL2HRGHfyLtLjDMA0O7eSN_QFD1a_g" 
  },
  { 
    title: "Core Resonance", 
    duration: "22 min", 
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrZvXNMCDH348UxyEayCTvJ8FC6rDWLN4H0C0DSdvNN4kDgUUQjZsn-DNvK3tUD1yw4ukEbZVeAoRm8cLp8_9hhagPDuRBxdqzoUzAm7YRLXhpz7Cp5AVX1Ct-EZtpKEecyZ7MXsyl1Pzm-G05Lwde59XPHsfUzxnUoyKnQgbAL161fG3CwywTSYuN4vsAGh4tt031eqIRY2_FWtOe0LdxQZY9EW3s97E50K6VkcvPJrFR506QO1IG3IfQWChyyie5-vHCxwlb5g" 
  },
];



// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function LoggedInHome() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [comingSoon, setComingSoon] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push("/login");
      }
    });

    supabase.from('sessions')
      .select('*')
      .eq('status', 'published')
      .eq('is_coming_soon', false)
      .limit(6)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSessions(data);
      });

    supabase.from('sessions')
      .select('*')
      .eq('status', 'published')
      .eq('is_coming_soon', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setComingSoon(data);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <>
      <Navbar />

      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto space-y-16">
        
        {/* Welcome Header */}
        <section className="space-y-4">
          <h1 className="font-headline text-5xl md:text-7xl font-black text-on-background tracking-tighter uppercase leading-tight">
            Welcome home, <span className="text-primary text-glow-primary">{firstName}</span>
          </h1>
          <p className="font-body text-xl text-on-surface-variant max-w-2xl">
            How are you feeling today?&nbsp;
          </p>
        </section>

        {/* Feeling Chips Row */}
        <section className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Link href="/library?free=true" className="px-8 py-3 rounded-full transition-all duration-300 font-headline font-bold uppercase tracking-wider text-sm" style={{ backgroundColor: "#ff41b3", color: "#000000" }}>
              Free Content
            </Link>
            {["Hungover", "After The Sesh", "On A Comedown", "Feeling Empty", "Can't Sleep", "Anxious", "Heartbroken", "Overwhelmed", "Low Energy", "Morning Reset", "Focus Mode", "Relationships", "Friendships", "Family", "Work"].map(mood => (
              <Link key={mood} href={`/library?mood=${mood}`} className="px-8 py-3 rounded-full transition-all duration-300 font-headline font-bold uppercase tracking-wider text-sm hover:opacity-80" style={{ backgroundColor: "#ff41b3", color: "#000000" }}>
                {mood}
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Right Now */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Trending Right Now</h2>
            <Link className="text-primary font-label text-xs font-bold uppercase tracking-widest hover:underline" href="/library">See All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {sessions.map((item: any) => (
              <LibraryCard key={item.id} session={item as LibrarySession} isPaidMember={false} />
            ))}
          </div>
        </section>

        {/* Dropping Soon (The Teaser Reel) — dynamic from DB */}
        {comingSoon.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Dropping Soon</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label text-[10px] font-extrabold uppercase text-primary tracking-[0.2em]">New Drops Weekly</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {comingSoon.map((item: any) => (
                <LibraryCard key={item.id} session={item as LibrarySession} isPaidMember={false} />
              ))}
            </div>
          </section>
        )}


      </main>

      <Footer />

      {/* BottomNavBar Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0e0e0e]/90 backdrop-blur-3xl flex justify-around items-center px-4 pt-3 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-[2rem]">
        <button className="flex flex-col items-center justify-center text-[#FF418E] drop-shadow-[0_0_8px_rgba(255,65,142,0.5)]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
          <span className="font-label text-[10px] font-bold tracking-wider uppercase mt-1">Listen</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200">
          <span className="material-symbols-outlined">search</span>
          <span className="font-label text-[10px] font-bold tracking-wider uppercase mt-1">Explore</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200">
          <span className="material-symbols-outlined">subscriptions</span>
          <span className="font-label text-[10px] font-bold tracking-wider uppercase mt-1">Library</span>
        </button>
        <Link href="/profile" className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-[10px] font-bold tracking-wider uppercase mt-1">Profile</span>
        </Link>
      </nav>

    </>
  );
}

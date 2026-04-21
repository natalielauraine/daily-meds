"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

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

const DROPPING_SOON = [
  {
    title: "Guilty",
    time: "Coming Friday",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMXiw-cheL9Dqx57KZrX1vk7u_ojbaq0per-l7HITRt5yzpJkOe2z_Xm_IQYzZBffU7djNZSeJuPQGlcivQymSxF4njvVtBFQJvdNfG-P56BluUDMfhp1l1rSkf3synvb2VCsow_aAd0rdr_H0ViNf3hKBnlzSJ1hAg1rT0LRGyUVogm__sM8A24J154eRyAKg3_NDKC8XYmeQl8bxUKpSPmaH2FBOZC6sXQ4Bev-gLf3h0SFAPOm190f1Wqy1w59oGNyf9R_Cow"
  },
  {
    title: "No Money",
    time: "In 4 Days",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIBM1cZOIjZfjsa8-dN-Qd-rZhMV7FJmJXuBoyVbZh3crb_Ez-TlMvrHIhf4M4brMATcTtF8p9Pj4GXKJDeWg9QQsVzhj_Y3z7EyZ8pjjFtf78EQ1P1DOKHfbT2W0F1Ob3crhnXiUJS2epFtDMxHMXgGg-JSMf5txJJ1biwjnsNUdRH5HKrIxHCeAr5-mQWD1zO4AI94rZPCM2QMPtL6K7ykcquu_2gjy0Up4NS6D6DfCLR-7iwWhIQ5KuTKhcwGZm31r7rNb3QA"
  },
  {
    title: "Stressed",
    time: "Next Week",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQzLBO_U9T5OVrHcEVwZt84ErowclO4VvsQyjwsTPwvPXWvCgDX_UhG9BK2OoM6JcdHOmcB0YLWhZJQmuW9axaCRxHTsKzqReZUpXDlPpTih1UV5T84xrOPpWpFIaXs7_qlQelXuHHfE4h7gNiyk4r-08YBjgixIa5RU0BqS2kLPqzmDpoyum4Fpw9dHcCorUDV3iJ_LPyhKNsKnKRm6hxZkKkP_WK3p6B9zlp3XYXzbpYLwUuLSWzYWY51cxCwjZLvlCaorHwbA"
  },
  {
    title: "Sober",
    time: "Stay Tuned",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKNpEY7Uchqb23uvgbJUy3QL_QADC2CCZbhcSlLVJndLxUIWxjpncvhEC3xL-6oJ_DAAEvEspDnRqX4SRX0hFplY1Np2iF2DvYlAIB6X_Sv7hLsTW7mhk-_EO4YUF5ANg55cAgumiC3LMSsYMJKHiX8rwXAs1rHHyU4pryuOI54A5vS_AyVCIU-U4Jl9HOIV9YCY9U41XDWNbI6h7n99Gp-TycSN_5R6EIRTK4NuIP7MCvnCVkUhHwU-sC0B2krRzp0x4ES0zasw"
  }
];

const RAISING_VIBES = [
  {
    title: "Electric Breath",
    subtitle: "15 Min Upcycle",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaxicWg70H9NKSbHQa9IIobvbBiT00tHZy8H2j46n9ywkKd1zvtAPbT7xJbf8mdImdUrBUtiMmnzPO4t9SKnMV_9vZU8aT7iTaVsANCy6vWMJZhDjBm0udAZ9_-t35YxGqMgUpd9KjVCDhPS2EDIaw3mfErlIA53p5dY_X557mSwghUcycRT5-IAgnzrduDOqiQw_X_7WWfb5OsuxjjxgNfh9OgCr43LRVUaCklOziq6r6HFiRvCcd5lbaGnyI1YTyc8P2x5poEg"
  },
  {
    title: "Sonic Lift",
    subtitle: "High BPM Focus",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDD9O9CA9gvFLweCP9z8VXKLVV_NgLCRwHjn8usvSxfFQR_Q4ABfN6KK6lOF0NoEE8K_WvMApXqrjf_h34hPXRKlj5MaPlVUun7xxflR2YBqD_g-QF4UGEPf89gGuWqdahyO57rkFSCgXNfKZyIJgzdAwrkZS4WXm4uk-lPurYfvA75MQ1s7sNCymIJL0BlKTEGscuGxJLoPlAYahsM-I6VDqrWW2w3fy5M_iWuGQoikdSkfe0_8-NvZFMbotnEAEWhiJyNCjCe-w"
  },
  {
    title: "Clear Sky",
    subtitle: "Mental Clarity",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjPXB1GsmMXNqAy2UHk1HHOus8wkEoBhjcD7oBhH6GCfUQmxQ7C3U_geqdeltbj8JdlVUjXgU-6CvWASRk2F071PO3hqsNIRofVMwAW8dOXtNNKIcKazEosx8IakVy3yy1URIdNCJZKohFH8yFytuIlVnlNWQqCzx75d-jQMbawoSdpqlppuujkNilUWM2MPEsgHoaO2TqtzSG2vTD1VYYSSuafdQZoK6zlBp7t5eIA9RFR7LDleETDO4hil7clfqrTSZl26AqjA"
  }
];

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function LoggedInHome() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

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
      .limit(6)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSessions(data);
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
            {["Anxious", "Flat", "Wired", "Sad", "Scattered"].map(mood => (
              <Link key={mood} href={`/library?mood=${mood}`} className="px-8 py-3 rounded-full bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 font-headline font-bold uppercase tracking-wider text-sm">
                {mood}
              </Link>
            ))}
            <Link href="/library?mood=Overwhelmed" className="px-8 py-3 rounded-full bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(255,65,142,0.4)] font-headline font-bold uppercase tracking-wider text-sm transition-all">
              Overwhelmed
            </Link>
          </div>
        </section>

        {/* Trending Right Now */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Trending Right Now</h2>
            <Link className="text-primary font-label text-xs font-bold uppercase tracking-widest hover:underline" href="/library">See All</Link>
          </div>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-4">
            {sessions.map((item, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] group cursor-pointer" onClick={() => router.push(`/session/${item.id}`)}>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4" style={{ background: item.gradient || "#2A2A2A" }}>
                  {item.image_url && <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.image_url} alt={item.title} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  
                  {/* Replaced empty image block with a subtle logo center focus if no image is present */}
                  {!item.image_url && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                        <path d="M24 4C24 4 16 12 16 20C16 24.4 19.6 28 24 28C28.4 28 32 24.4 32 20C32 12 24 4 24 4Z" fill="white" opacity="0.95"/>
                        <circle cx="24" cy="28" r="2" fill="white" opacity="0.9"/>
                      </svg>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                    <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter">{item.duration}</span>
                    <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  </div>
                </div>
                <h3 className="font-headline font-bold uppercase text-lg group-hover:text-primary transition-colors">{item.title}</h3>
              </div>
            ))}
            {/* Hint Card */}
            <div className="min-w-[280px] md:min-w-[320px] opacity-40 group cursor-pointer">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuWXeOg1DRLC_SEcgMWHtNaj6Fmm8oM5oRWWBpvYzRbsWev6ulR9bnRZT0lrq3SqSelJUKJ20L5BZGQGdbA8cggqt9_30Tp29wG1oB8dhGONiTjSqhGx6MH6iL7p6GaBMHWigbLPOVDsSivJgLW6bvUEiyovzzU3JcYTx0ntIJkGeV3recaqZcEsdIznkO3lK-144JumsLsGJmhdTBhJI9s3dB9zGldC6e8MkNQCj-wPj65dERX62gxb7pGvXjkPnRCJH6jtcssg" alt="Hint" />
              </div>
            </div>
          </div>
        </section>

        {/* Dropping Soon (The Teaser Reel) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Dropping Soon</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label text-[10px] font-extrabold uppercase text-primary tracking-[0.2em]">New Drops Weekly</span>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-4">
            {DROPPING_SOON.map((item, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] group relative cursor-not-allowed">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 grayscale hover:grayscale-0 transition-all duration-700">
                  <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">{item.title}</span>
                    <span className="mt-4 text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Raising Your Vibe */}
        <section className="space-y-6">
          <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Raising Your Vibe</h2>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-4">
            {RAISING_VIBES.map((item, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[350px] group cursor-pointer">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src={item.image} alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="text-secondary font-headline text-3xl font-black uppercase tracking-tighter leading-none block mb-2">{item.title}</span>
                    <span className="text-white/80 font-label text-xs font-bold uppercase tracking-widest">{item.subtitle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

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

      {/* Global Music Player Overlay (Persistent Cinematic Element) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-xl z-40 md:bottom-8">
        <div className="bg-surface-container/60 backdrop-blur-3xl border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZgOEfqJg8ic8jgLOxBxDNY9KoBb1ISPVH9_ZfN30O-gZgEtn9eYGH1e2CJ5kUayGkXFS931TDOe9O_ozf9RQpJaTydARwyCMKQHKi2xvq6JOObUUtYn8DG-IwrgeMS77TgiNLuJWrEWC6CxOp7BQ-jSLr2QH_da_CbO8utlx_Wn2N1d5c_lCqi4qLs4lMKHUKa3LDxkloWhlfq1Qwds6vE48IKelkZaolmyWbUQhgBi7oYbkNk39aoDDBm0AfQmShDiKfBG9Ow" alt="Thumbnail" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-headline text-sm font-bold uppercase truncate">Shadow Work</h4>
            <p className="font-label text-[10px] text-zinc-400 uppercase tracking-widest">04:12 / 12:00</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-zinc-400 hover:text-white">skip_previous</button>
            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
            </button>
            <button className="material-symbols-outlined text-zinc-400 hover:text-white">skip_next</button>
          </div>
        </div>
      </div>
    </>
  );
}

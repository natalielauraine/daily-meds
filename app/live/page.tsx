import Link from "next/link";
import Image from "next/image";
import Logo from "../components/Logo";
import { createClient } from "../../lib/supabase-server";


const EVENT_TYPES = [
  {
    title: "Live Audio Hugs",
    desc: "Live meditations with founder Natalie",
    img: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/audio%20hug%20thum.png",
  },
  {
    title: "Live Alchemy Rewire",
    desc: "Breathwork with Natalie & Friends",
    img: "https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/public/share%20cards/alchemy%20rewire%20thum.png",
  },
];

export default async function LiveLandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div style={{ backgroundColor: "#0e0e0e", color: "#ffffff", fontFamily: "var(--font-manrope)" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-20"
        style={{
          background: "rgba(14,14,14,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Logo href="/" size="md" />
        <nav className="hidden md:flex items-center gap-10">
          {[
            { label: "Home", href: "/" },
            { label: "Live", href: "/live" },
            { label: "Pricing", href: "/pricing" },
            { label: "Breathe", href: "/timer" },
            { label: "About", href: "/about" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-[#aaee20]"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-lexend)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all hover:opacity-90"
          style={{ backgroundColor: "#aaee20", color: "#324b00", fontFamily: "var(--font-lexend)" }}
        >
          Login
        </Link>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop&q=80')",
          }}
        />
        {/* Cinematic overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(1,1,1,0.3) 0%, rgba(1,1,1,0.85) 100%)" }} />

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <h1
            className="uppercase leading-none tracking-tighter"
            style={{
              fontFamily: "var(--font-lexend)",
              fontWeight: 900,
              fontSize: "clamp(3.5rem, 10vw, 8rem)",
            }}
          >
            Going Live{" "}
            <span style={{ color: "#aaee20" }}>Every Week</span>
          </h1>
          <div className="mt-8">
            <Link
              href="/signup"
              className="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-base transition-all hover:opacity-90"
              style={{
                backgroundColor: "#aaee20",
                color: "#324b00",
                fontFamily: "var(--font-lexend)",
                boxShadow: "0 0 20px rgba(170,238,32,0.4)",
              }}
            >
              Explore Sessions
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIVE EVENT TYPES ───────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        <h2
          className="text-3xl uppercase tracking-tight mb-12"
          style={{ fontFamily: "var(--font-lexend)", fontWeight: 700 }}
        >
          Live Event Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
          {EVENT_TYPES.map((event) => (
            <Link href={isLoggedIn ? "/live" : "/signup"} key={event.title} className="group cursor-pointer">
              <div
                className="relative overflow-hidden rounded-xl mb-6"
                style={{ aspectRatio: "16/9" }}
              >
                <Image
                  src={event.img}
                  alt={event.title}
                  fill
                  unoptimized
                  sizes="(max-width:768px) 100vw, 500px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3
                className="text-xl uppercase mb-2 group-hover:text-[#aaee20] transition-colors"
                style={{ fontFamily: "var(--font-lexend)", fontWeight: 700 }}
              >
                {event.title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.55)" }}>{event.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── UPGRADE CTA ────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-24 mb-24 max-w-[1440px] mx-auto">
        <div
          className="rounded-2xl p-12 md:p-20 relative overflow-hidden text-center"
          style={{
            background: "rgba(26,25,25,0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(170,238,32,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,65,179,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />

          <h2
            className="uppercase tracking-tighter mb-8 max-w-3xl mx-auto leading-tight"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Upgrade to Monthly Live
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
            To enjoy the access to Natalie and her network of friends and experts in the fields of sound, music and wellness you can upgrade your membership for <strong style={{ color: "#ffffff" }}>£19.99/month</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-12 py-5 rounded-full font-black uppercase tracking-widest text-lg transition-all hover:opacity-90"
              style={{ backgroundColor: "#aaee20", color: "#324b00", fontFamily: "var(--font-lexend)", boxShadow: "0 0 20px rgba(170,238,32,0.4)" }}
            >
              Upgrade Now
            </Link>
            <Link
              href="/signup"
              className="px-12 py-5 rounded-full font-bold uppercase tracking-widest text-lg transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-lexend)" }}
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE THE COLLECTIVE PULSE ────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: "#141313" }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2
              className="uppercase tracking-tight mb-6"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Experience the Collective Pulse
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Join our digital sanctuary where real-time connection meets deep introspection. Engage with the community through our curated live chat, feel the shared energy of thousands of simultaneous meditators, and interact directly with Natalie during our weekly sessions.
            </p>
            <ul className="space-y-4">
              {[
                { icon: "💬", text: "Real-time expert Q&A" },
                { icon: "🌍", text: "Synchronized global breathwork" },
                { icon: "💚", text: "Live community presence indicators" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-4 font-medium">
                  <span className="text-xl">{item.icon}</span>
                  <span style={{ color: "#ffffff" }}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Live session UI mockup */}
          <div className="relative">
            <div
              className="rounded-xl overflow-hidden p-3"
              style={{ background: "rgba(26,25,25,0.8)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
            >
              {/* Mock video area */}
              <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: "16/10", background: "linear-gradient(135deg, #0a1a00 0%, #1a0a00 50%, #0a000f 100%)" }}>
                {/* Pulsing live badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase" style={{ backgroundColor: "#ff41b3", fontFamily: "var(--font-lexend)" }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  Live
                </div>
                {/* Viewer count */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  2,847
                </div>
                {/* Central presenter circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black"
                    style={{ background: "linear-gradient(135deg, #ff41b3, #ec723d)", fontFamily: "var(--font-lexend)" }}
                  >
                    N
                  </div>
                </div>
                {/* Bottom session info */}
                <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
                  <p className="text-xs font-bold uppercase" style={{ color: "#aaee20", fontFamily: "var(--font-lexend)" }}>Full Moon Lunar Release</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>with Natalie Lauraine</p>
                </div>
              </div>

              {/* Mock chat panel */}
              <div className="mt-3 space-y-2 px-1 pb-1">
                {[
                  { name: "Sarah M.", msg: "This is exactly what I needed tonight 🌙", color: "#aaee20" },
                  { name: "James K.", msg: "Feeling the collective energy fr 💚", color: "#ff41b3" },
                  { name: "Emma W.", msg: "Natalie your voice is so calming", color: "#ec723d" },
                ].map((chat) => (
                  <div key={chat.name} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black text-white" style={{ background: chat.color }}>
                      {chat.name[0]}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold mr-1" style={{ color: chat.color }}>{chat.name}</span>
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{chat.msg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full pointer-events-none" style={{ background: "rgba(170,238,32,0.15)", filter: "blur(40px)" }} />
          </div>
        </div>
      </section>


      {/* ── UPCOMING SESSIONS ──────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-[1000px] mx-auto text-center">
        <h2 className="text-3xl uppercase tracking-tight mb-12" style={{ fontFamily: "var(--font-lexend)", fontWeight: 700 }}>
          Upcoming Sessions
        </h2>
        <div
          className="py-16 px-8 rounded-2xl"
          style={{ border: "1px solid rgba(170,238,32,0.15)", backgroundColor: "rgba(170,238,32,0.04)" }}
        >
          <p className="text-lg mb-3" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-lexend)", fontWeight: 600 }}>
            Live sessions coming soon.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-lexend)" }}>
            <a
              href="mailto:joy@thedailymeds.com"
              className="underline underline-offset-4 transition-colors hover:text-[#aaee20]"
              style={{ color: "rgba(255,255,255,0.4)", textDecorationColor: "#aaee20" }}
            >
              Join the waitlist
            </a>{" "}
            to be notified when we go live.
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#000000", borderTop: "1px solid rgba(255,255,255,0.06)" }} className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-xs">
            <Logo href="/" size="sm" />
            <p className="mt-6 text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
              A high-fidelity digital sanctuary designed for the modern collective mind. We breathe together.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {[
              { heading: "Explore", links: [{ label: "Library", href: "/library" }, { label: "Pricing", href: "/pricing" }, { label: "Live", href: "/live" }] },
              { heading: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/about" }, { label: "Podcasts", href: "/podcasts" }] },
              { heading: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }] },
            ].map((col) => (
              <div key={col.heading}>
                <h5 className="font-bold text-white uppercase text-xs tracking-widest mb-6" style={{ fontFamily: "var(--font-lexend)" }}>{col.heading}</h5>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-20 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} The Daily Meds. All rights reserved. Cinematic meditation for the collective.
          </p>
        </div>
      </footer>
    </div>
  );
}

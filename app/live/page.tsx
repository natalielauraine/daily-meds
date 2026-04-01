import Link from "next/link";
import Logo from "../components/Logo";

const UPCOMING = [
  { date: "Oct 12", time: "8:00 PM EST", title: "Full Moon Lunar Release", desc: "Meditation & Sound Bath with Natalie" },
  { date: "Oct 15", time: "10:00 AM EST", title: "Vagus Nerve Reset", desc: "Alchemy Rewire Workshop" },
  { date: "Oct 19", time: "7:00 PM EST", title: "The Science of Sleep", desc: "Live Podcast Guest: Dr. Aris" },
];

const PODCASTS = [
  {
    tag: "Expert Interview",
    title: "Sound Healing with Robert",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop&q=80",
  },
  {
    tag: "Wellness Expert",
    title: "The Physics of Frequency",
    img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=340&fit=crop&q=80",
  },
  {
    tag: "Community Story",
    title: "Breath as a Bridge",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=340&fit=crop&q=80",
  },
];

const EVENT_TYPES = [
  {
    title: "Live Audio Hugs",
    desc: "Live meditations with founder Natalie",
    img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=700&fit=crop&q=80",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="#aaee20">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    ),
  },
  {
    title: "Live Alchemy Rewire",
    desc: "Breathwork with Natalie & Friends",
    img: "https://images.unsplash.com/photo-1474223960279-c596b5ac7c0c?w=500&h=700&fit=crop&q=80",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="#ff41b3">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
  },
  {
    title: "Live Podcasts",
    desc: "Expert network interviews with Natalie",
    img: "https://images.unsplash.com/photo-1478737270197-578ade936942?w=500&h=700&fit=crop&q=80",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="#ec723d">
        <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
      </svg>
    ),
  },
];

export default function LiveLandingPage() {
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
            { label: "Library", href: "/library" },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EVENT_TYPES.map((event) => (
            <Link href="/signup" key={event.title} className="group cursor-pointer">
              <div
                className="relative overflow-hidden rounded-xl mb-6"
                style={{ aspectRatio: "3/4" }}
              >
                <img
                  src={event.img}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.3)" }} />
                <div className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.2)" }} />
                {/* Icon overlay */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                  {event.icon}
                </div>
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

      {/* ── PREVIOUS PODCASTS ──────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl uppercase tracking-tight" style={{ fontFamily: "var(--font-lexend)", fontWeight: 700 }}>
            Watch Previous Podcasts
          </h2>
          <Link href="/signup" className="text-sm font-bold uppercase tracking-widest hover:underline" style={{ color: "#aaee20", fontFamily: "var(--font-lexend)" }}>
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PODCASTS.map((pod) => (
            <Link href="/signup" key={pod.title} className="group cursor-pointer space-y-4">
              <div className="aspect-video overflow-hidden rounded-xl">
                <img
                  src={pod.img}
                  alt={pod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#aaee20", fontFamily: "var(--font-lexend)" }}>
                {pod.tag}
              </span>
              <h3 className="text-lg uppercase font-bold group-hover:text-[#aaee20] transition-colors" style={{ fontFamily: "var(--font-lexend)" }}>
                {pod.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ── UPCOMING SESSIONS ──────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-[1000px] mx-auto">
        <h2 className="text-3xl uppercase tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-lexend)", fontWeight: 700 }}>
          Upcoming Sessions
        </h2>
        <div>
          {UPCOMING.map((session, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row items-center justify-between py-8 px-6 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="flex flex-col">
                  <span className="text-2xl font-black uppercase" style={{ color: "#aaee20", fontFamily: "var(--font-lexend)" }}>{session.date}</span>
                  <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{session.time}</span>
                </div>
                <div className="hidden md:block h-8 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
                <div>
                  <h4 className="text-xl uppercase font-bold mb-1" style={{ fontFamily: "var(--font-lexend)" }}>{session.title}</h4>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{session.desc}</p>
                </div>
              </div>
              <Link
                href="/signup"
                className="mt-6 md:mt-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all hover:bg-[#aaee20] hover:text-[#324b00]"
                style={{ border: "1px solid rgba(170,238,32,0.4)", color: "#ffffff", fontFamily: "var(--font-lexend)" }}
              >
                Reminder
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            href="/signup"
            className="font-bold uppercase text-sm tracking-widest hover:text-white transition-colors underline underline-offset-8"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-lexend)", textDecorationColor: "#aaee20" }}
          >
            See Full Calendar
          </Link>
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
              { heading: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/about" }, { label: "Journal", href: "/blog" }] },
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

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Live — Coming Soon | The Daily Meds",
};

export default function LiveComingSoonPage() {
  return (
    <div style={{ backgroundColor: "#131313", color: "#ffffff", minHeight: "100vh" }}>
      <Navbar />
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      >
      {/* Glow accents */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,65,179,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "15%",
          right: "20%",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,114,61,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          bottom: "20%",
          left: "25%",
        }}
      />

      {/* Live badge */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
        style={{
          background: "rgba(255,65,179,0.12)",
          border: "1px solid rgba(255,65,179,0.2)",
        }}
      >
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: "#ff41b3" }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ background: "#ff41b3" }}
          />
        </span>
        <span
          className="text-xs uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 700,
            color: "#ff41b3",
          }}
        >
          Live
        </span>
      </div>

      <h1
        className="text-4xl sm:text-5xl md:text-6xl mb-6"
        style={{
          fontFamily: "var(--font-epilogue)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#ffffff",
        }}
      >
        Coming Soon
      </h1>

      <p
        className="text-base sm:text-lg max-w-lg mb-10 leading-relaxed"
        style={{
          fontFamily: "var(--font-manrope)",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Live sessions with Natalie are coming soon. In the meantime, explore
        our meditation library.
      </p>

      <Link
        href="/library"
        className="px-8 py-3 rounded-full text-sm uppercase tracking-widest transition-all hover:opacity-90"
        style={{
          fontFamily: "var(--font-space-grotesk)",
          fontWeight: 700,
          background: "#ff41b3",
          color: "#ffffff",
          boxShadow: "0 0 20px rgba(255,65,179,0.3)",
        }}
      >
        Explore the Library
      </Link>
      </div>
      <Footer />
    </div>
  );
}

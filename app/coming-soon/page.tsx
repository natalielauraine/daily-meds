import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Coming Soon | The Daily Meds",
};

export default function ComingSoonPage() {
  return (
    <div style={{ backgroundColor: "#131313", color: "#ffffff", minHeight: "100vh" }}>
      <Navbar />
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
      >
      {/* Glow accent */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,65,179,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

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
        className="text-base sm:text-lg max-w-md mb-10 leading-relaxed"
        style={{
          fontFamily: "var(--font-manrope)",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        We&apos;re working on something special. Stay tuned.
      </p>

      <Link
        href="/sessions"
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

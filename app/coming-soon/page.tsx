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

      {/* Hero with background image */}
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/natalie-story-crop.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(19,19,19,0.85) 70%, #131313 100%)" }}
        />

        {/* Glow accent */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,65,179,0.15) 0%, transparent 70%)",
            filter: "blur(80px)",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl mb-8"
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
            className="text-base sm:text-lg md:text-xl mb-10 leading-relaxed"
            style={{
              fontFamily: "var(--font-manrope)",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Something special is on its way. Natalie will soon be going live with streaming Audio Hugs&#8482;
            meditations, joined by her collaborators for somatic practices and nervous system regulation
            breathwork, delivered by Alchemy Rewire&#8482; practitioners. Live podcasts are also coming.
          </p>

          <Link
            href="/sessions"
            className="inline-block px-8 py-3 rounded-full text-sm uppercase tracking-widest transition-all hover:opacity-90"
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
      </div>

      {/* Video section */}
      <div className="px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl mb-4"
            style={{
              fontFamily: "var(--font-epilogue)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            In the meantime
          </h2>
          <p
            className="text-base sm:text-lg mb-10 leading-relaxed"
            style={{
              fontFamily: "var(--font-manrope)",
              color: "rgba(246,241,230,0.7)",
            }}
          >
            Watch Natalie in conversation with Dr John Stewart-Reed on LinkedIn
          </p>

          {/* YouTube embed */}
          <div
            className="relative w-full overflow-hidden rounded-2xl"
            style={{
              paddingTop: "56.25%",
              boxShadow: "0 0 40px rgba(255,65,179,0.1)",
            }}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/OvgWX--WXaQ"
              title="Natalie in conversation with Dr John Stewart-Reed"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ border: "none" }}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["HUMAN", "DIFFERENT", "REAL", "RAW"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative overflow-hidden" style={{ backgroundColor: "#0e0e0e" }}>
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.4,
          zIndex: 0,
        }}
      >
        <source src="https://uuglprtvwvumucnkrshj.supabase.co/storage/v1/object/sign/Video%20Files/The%20Daily%20Meds%20Hero%20Video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNGJkYTgyYS0wZDEzLTRmM2UtOGRiNi0xZTlkYmE0OGJiNDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJWaWRlbyBGaWxlcy9UaGUgRGFpbHkgTWVkcyBIZXJvIFZpZGVvLm1wNCIsImlhdCI6MTc3NTQyMDMxNCwiZXhwIjoyMDkwNzgwMzE0fQ.uwCSfVYuNesDYQCANhuzACoYwWZwemZuOMhkp1S-D8Y" type="video/mp4" />
      </video>
      {/* Dark overlay so text stays readable */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)", zIndex: 1 }} />
      <div className="container mx-auto px-6" style={{ position: "relative", zIndex: 2 }}>
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">

          {/* Headline */}
          <div className="flex gap-4 flex-col items-center">
            <h1
              className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center"
              style={{ fontFamily: "var(--font-nyata), var(--font-lexend)", fontWeight: 900, color: "#ffffff", lineHeight: 1.05 }}
            >
              <span className="uppercase">THIS IS SOMETHING</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1" style={{ height: "1.2em" }}>
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    style={{
                      background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontFamily: "var(--font-nyata), var(--font-lexend)",
                    }}
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p
              className="text-xl md:text-2xl leading-relaxed tracking-tight max-w-xl text-center"
              style={{ color: "#ffffff", fontFamily: "var(--font-manrope)" }}
            >
              The Netflix of meditation, for life&apos;s most awkward moments.
            </p>

            <p
              className="text-sm md:text-base tracking-tight text-center"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-manrope)" }}
            >
              Just £9.99 a month. Cancel anytime.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-row gap-3 flex-wrap justify-center">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all hover:scale-105"
              style={{
                background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
                color: "#ffffff",
                fontFamily: "var(--font-lexend)",
              }}
            >
              Start free today <MoveRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export { Hero };

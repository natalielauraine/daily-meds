"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["DIFFERENT", "NEEDED", "REAL", "HUMAN"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full" style={{ backgroundColor: "#0e0e0e" }}>
      <div className="container mx-auto px-6">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">

          {/* Badge */}
          <Link
            href="/free"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold transition-opacity hover:opacity-70"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--font-lexend)",
            }}
          >
            Listen for free <MoveRight className="w-3 h-3" />
          </Link>

          {/* Headline */}
          <div className="flex gap-4 flex-col items-center">
            <h1
              className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 900, color: "#ffffff", lineHeight: 1.05 }}
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
                      fontFamily: "var(--font-lexend)",
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
              className="text-lg md:text-xl leading-relaxed tracking-tight max-w-xl text-center"
              style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-manrope)" }}
            >
              Audio for emotional emergencies. Guided meditation and breathwork
              for life&apos;s most awkward moments — hangover, anxiety, heartbreak,
              can&apos;t sleep. We&apos;ve got a session for that.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-row gap-3 flex-wrap justify-center">
            <Link
              href="/free"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all hover:opacity-80"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontFamily: "var(--font-lexend)",
              }}
            >
              Browse free sessions <MoveRight className="w-4 h-4" />
            </Link>
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

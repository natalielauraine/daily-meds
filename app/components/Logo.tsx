// Logo — The Daily Meds brand mark.
// Uses Nyata Extra Bold loaded from /public/fonts/Nyata-ExtraBold.ttf via globals.css.
// Falls back to Lexend if Nyata fails to load.

import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

export default function Logo({ href = "/", size = "md" }: LogoProps) {
  const textSize = SIZES[size];

  const content = (
    <span
      className={`font-black uppercase tracking-tight whitespace-nowrap ${textSize}`}
      style={{
        fontFamily: "var(--font-nyata), var(--font-lexend), sans-serif",
        background: "linear-gradient(90deg, #ff41b3 0%, #ec723d 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        letterSpacing: "-0.01em",
      }}
    >
      THE DAILY MEDS
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

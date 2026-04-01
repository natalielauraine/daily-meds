// Logo — The Daily Meds brand mark.
// Text logo: "THE DAILY MEDS" in pink → orange gradient.
// Primary font: Nyata Extra Bold (paid font — swap var(--font-nyata) once the
// font file is added to /public/fonts and loaded in layout.tsx).
// Fallback: Space Grotesk Black (already loaded).

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
      className={`font-black uppercase tracking-tight ${textSize}`}
      style={{
        // Swap to var(--font-nyata) once Nyata Extra Bold is added to the project
        fontFamily: "var(--font-nyata), var(--font-space-grotesk), sans-serif",
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

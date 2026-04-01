// Reusable dark card wrapper — used across every page.
// bg #1F1F1F, 0.5px border rgba(255,255,255,0.08), border-radius 10px.

import { CSSProperties, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: string; // Tailwind padding class e.g. "p-6", "p-5", "p-4"
};

export default function Card({ children, className = "", style, padding = "p-6" }: CardProps) {
  return (
    <div
      className={`rounded-[10px] ${padding} ${className}`}
      style={{ backgroundColor: "#1F1F1F", border: "0.5px solid rgba(255,255,255,0.08)", ...style }}
    >
      {children}
    </div>
  );
}

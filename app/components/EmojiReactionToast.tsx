"use client";

// EmojiReactionToast — floating emoji animation that plays when another user
// sends the current user a reaction while they're meditating.
//
// The emoji floats up from the bottom of the screen and fades out.
// This component is mounted in layout.tsx so it works on any page.

import { useEffect, useState } from "react";
import { usePresence } from "../../lib/presence-context";

interface FloatingEmoji {
  id: string;
  emoji: string;
  from_name: string;
  x: number; // horizontal position as a percentage (20–75%) for variety
}

export default function EmojiReactionToast() {
  const { incomingEmoji, clearIncomingEmoji } = usePresence();
  const [floaters, setFloaters] = useState<FloatingEmoji[]>([]);

  // When a new emoji reaction comes in, add it to the floaters list
  useEffect(() => {
    if (!incomingEmoji) return;

    const floater: FloatingEmoji = {
      ...incomingEmoji,
      // Random horizontal position so multiple emojis don't stack exactly
      x: 20 + Math.random() * 55,
    };

    setFloaters((prev) => [...prev, floater]);
    clearIncomingEmoji();

    // Remove this floater after the animation finishes (2.5s)
    const timer = setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== floater.id));
    }, 2800);

    return () => clearTimeout(timer);
  }, [incomingEmoji]);

  if (floaters.length === 0) return null;

  return (
    // Overlay covers the whole screen but is non-interactive (pointer-events-none)
    <div className="fixed inset-0 pointer-events-none z-[200]" aria-hidden="true">
      {floaters.map((f) => (
        <div
          key={f.id}
          className="absolute flex flex-col items-center animate-float-up"
          style={{ left: `${f.x}%`, bottom: "6rem" }}
        >
          {/* The emoji itself */}
          <span className="text-5xl drop-shadow-lg">{f.emoji}</span>

          {/* Sender's name fades in below */}
          <span
            className="mt-1 text-xs text-white/60 rounded-full px-2 py-0.5"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          >
            from {f.from_name}
          </span>
        </div>
      ))}
    </div>
  );
}

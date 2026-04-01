"use client";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        backgroundColor: "#0e0e0e",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-lexend)", fontWeight: 300 }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 mt-auto pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#ffffff", fontFamily: "var(--font-lexend)" }}>
            {testimonial.name}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-lexend)" }}>
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScrollingColumn({
  testimonials,
  direction = "up",
  duration = 40,
}: {
  testimonials: Testimonial[];
  direction?: "up" | "down";
  duration?: number;
}) {
  const doubled = [...testimonials, ...testimonials];
  const animationName = direction === "up" ? "scroll-up" : "scroll-down";

  return (
    <div
      style={{
        flex: 1,
        overflow: "hidden",
        height: 600,
        position: "relative",
        minWidth: 0,
      }}
    >
      {/* Top fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(to bottom, #010101, transparent)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(to top, #010101, transparent)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          animation: `${animationName} ${duration}s linear infinite`,
        }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
        ))}
      </div>

      <style>{`
        @keyframes scroll-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          from { transform: translateY(-50%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function TestimonialsV2({ columns }: { columns: Testimonial[][] }) {
  const durations = [35, 45, 38];
  const directions: ("up" | "down")[] = ["up", "down", "up"];

  return (
    <div style={{ display: "flex", gap: 16, width: "100%", overflow: "hidden", padding: "0 16px" }}>
      {columns.map((col, i) => (
        <ScrollingColumn
          key={i}
          testimonials={col}
          direction={directions[i]}
          duration={durations[i]}
        />
      ))}
    </div>
  );
}

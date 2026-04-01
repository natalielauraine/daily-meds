// Coloured pill badge showing a user's subscription tier.
// Used on the profile page and anywhere subscription status is displayed.

const TIER_CONFIG: Record<string, { label: string; gradient: string }> = {
  free: {
    label: "Free",
    gradient: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
  },
  monthly: {
    label: "Monthly",
    gradient: "linear-gradient(135deg, #ff41b3, #ec723d)",
  },
  annual: {
    label: "Annual",
    gradient: "linear-gradient(135deg, #ff41b3, #f4e71d)",
  },
  lifetime: {
    label: "Lifetime",
    gradient: "linear-gradient(135deg, #ff41b3, #ec723d, #adf225)",
  },
  payment_failed: {
    label: "Payment Failed",
    gradient: "linear-gradient(135deg, #ec723d, #f4e71d)",
  },
};

export default function StatusBadge({ tier }: { tier: string }) {
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.free;
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white uppercase"
      style={{
        background: config.gradient,
        fontFamily: "var(--font-space-grotesk)",
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
      </svg>
      {config.label}
    </div>
  );
}

// Offline fallback — shown by the service worker when the user has no connection
// and the requested page isn't cached. Static, no data fetching.

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#131313",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        fontFamily: "Inter, -apple-system, sans-serif",
      }}
    >
      {/* Logo */}
      <p
        style={{
          fontSize: "13px",
          letterSpacing: "3px",
          fontWeight: 500,
          marginBottom: "48px",
          color: "#ffffff",
        }}
      >
        <span style={{ color: "#ff41b3" }}>THE </span>
        <span style={{ color: "#ec723d" }}>DAILY </span>
        <span style={{ color: "#adf225" }}>MEDS</span>
      </p>

      {/* Icon */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "20px",
          background: "rgba(255,65,179,0.1)",
          border: "0.5px solid rgba(255,65,179,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "28px",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 006.95 0M12 20h.01"
            stroke="#ff41b3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Copy */}
      <h1
        style={{
          color: "#ffffff",
          fontSize: "28px",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          lineHeight: 1.15,
          marginBottom: "12px",
          margin: "0 0 12px",
        }}
      >
        You&apos;re offline.
      </h1>

      <p
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: "15px",
          lineHeight: 1.6,
          maxWidth: "280px",
          margin: "0 0 36px",
        }}
      >
        No connection right now. Pages you&apos;ve already visited are available
        — try going back to the library.
      </p>

      {/* Back button */}
      <a
        href="/library"
        style={{
          background: "linear-gradient(135deg, #ff41b3, #ec723d)",
          color: "#ffffff",
          borderRadius: "14px",
          padding: "14px 32px",
          fontSize: "13px",
          fontWeight: 800,
          textDecoration: "none",
          display: "inline-block",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        Go to library
      </a>
    </div>
  );
}

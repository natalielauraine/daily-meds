"use client";

// Vimeo video player — used for all pre-recorded video meditation sessions.
// Audio-only sessions use AudioPlayer.tsx instead.
// The iframe embed hides all Vimeo branding (title, byline, portrait).

type VideoPlayerProps = {
  vimeoId: string;    // The numeric Vimeo video ID — e.g. "123456789"
  title: string;      // Used for the iframe accessibility label
};

export default function VideoPlayer({ vimeoId, title }: VideoPlayerProps) {
  // Build the Vimeo embed URL — hide branding, match brand purple accent colour
  const embedUrl = [
    `https://player.vimeo.com/video/${vimeoId}`,
    "?title=0",          // Hide video title
    "&byline=0",         // Hide uploader name
    "&portrait=0",       // Hide uploader avatar
    "&color=ff41b3",     // Brand pink for progress bar
    "&transparent=0",    // Solid background
    "&dnt=1",            // Do Not Track
  ].join("");

  if (!vimeoId) {
    return (
      <div
        className="aspect-video w-full rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        <p className="text-white/30 text-sm">Video not yet uploaded</p>
      </div>
    );
  }

  return (
    // aspect-video keeps the embed at 16:9 regardless of screen width
    <div className="aspect-video w-full rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        style={{ border: "none" }}
      />
    </div>
  );
}

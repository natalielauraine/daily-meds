import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Don't precache everything — just cache visited pages/assets on the fly
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Disable the service worker in development so hot reload isn't affected
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },
    ];
  },
  // Skip ESLint during Vercel builds — linting errors won't block deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // Supabase storage (user uploads, podcast covers, logos)
      { protocol: "https", hostname: "uuglprtvwvumucnkrshj.supabase.co" },
      // Google OAuth avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // YouTube thumbnails (admin content page)
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default withPWA(nextConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
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

export default nextConfig;

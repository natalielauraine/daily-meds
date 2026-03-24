/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during Vercel builds — linting errors won't block deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

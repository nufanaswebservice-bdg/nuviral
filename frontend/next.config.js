/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker standalone deployment (Railway)
  output: 'standalone',
  images: {
    domains: ['cdn.viralai.com', 'lh3.googleusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

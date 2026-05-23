/** @type {import('next').NextConfig} */
const nextConfig = {
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

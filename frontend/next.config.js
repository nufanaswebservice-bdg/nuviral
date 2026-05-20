/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.viralai.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

module.exports = nextConfig;

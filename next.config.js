/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 
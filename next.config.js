// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'yourdomain.com'],
  },
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
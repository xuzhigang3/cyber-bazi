import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Only run in development to set up local Cloudflare platform bindings
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;

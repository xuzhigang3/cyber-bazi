import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cloudflare Next-on-Pages requires these for static assets
};

if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform();
}

export default nextConfig;

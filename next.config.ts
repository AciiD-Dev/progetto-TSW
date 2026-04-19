import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.243.189', '192.168.17.189', '3000-inraoogveg2ylxxb7j39l-8a621b8a.us2.manus.computer', '127.0.0.1'],

  // Tell Next.js NOT to bundle better-sqlite3 — it must remain a native
  // Node.js addon loaded at runtime. Without this, Vercel's build will fail
  // because it tries to statically analyse the C++ binary.
  serverExternalPackages: ['better-sqlite3'],

  // Force Vercel to include the pre-seeded SQLite file in every
  // API route's serverless function bundle so it's available at runtime.
  outputFileTracingIncludes: {
    '/api/**': ['./homedb.sqlite'],
  },

  // Redirect root to /rooms — the root (dashboard)/page.tsx is a heavy
  // 'use client' component that causes ERR_FAILED on Vercel due to
  // localStorage access during SSR. /rooms is stable and fully functional.
  // Next.js config redirects run BEFORE the proxy middleware so this is safe.
  async redirects() {
    return [
      {
        source: '/',
        destination: '/rooms',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

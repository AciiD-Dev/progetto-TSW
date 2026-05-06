import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Comma-separated list of extra origins allowed in dev mode.
  // Example: ALLOWED_DEV_ORIGINS=192.168.1.100,10.0.0.5
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS
    ? process.env.ALLOWED_DEV_ORIGINS.split(',').map((o) => o.trim())
    : [],

  // Tell Next.js NOT to bundle better-sqlite3 — it must remain a native
  // Node.js addon loaded at runtime. Without this, Vercel's build will fail
  // because it tries to statically analyse the C++ binary.
  serverExternalPackages: ['better-sqlite3'],

  // Force Vercel to include the pre-seeded SQLite file in every
  // API route's serverless function bundle so it's available at runtime.
  outputFileTracingIncludes: {
    '/api/**': ['./homedb.sqlite'],
  },
};

export default nextConfig;

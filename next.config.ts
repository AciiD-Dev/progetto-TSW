import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.243.189', '192.168.17.189', '127.0.0.1', '172.18.141.246'],

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

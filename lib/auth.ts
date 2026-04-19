/**
 * Auth utilities for HomeHub.
 *
 * - Password hashing with bcryptjs (pure JS — no native deps)
 * - JWT signing/verification with jose (Edge-compatible)
 *
 * Tokens are stored in an HttpOnly cookie `hh_token` with 24h expiry.
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// ── Configuration ────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'homehub-dev-secret-change-in-prod-2024'
);
const ALGORITHM = 'HS256';
const TOKEN_EXPIRY = '24h';
export const COOKIE_NAME = 'hh_token';

// ── Password helpers ─────────────────────────────────────────────────────────

// On Vercel serverless, CPU is throttled — 10 rounds = ~3-5s latency.
// 8 rounds = ~0.5s and is still cryptographically safe for a demo app.
// bcrypt.compare() auto-reads the rounds from the stored hash, so
// existing hashes (rounds=10) continue to work for verification.
const SALT_ROUNDS = process.env.NODE_ENV === 'production' ? 8 : 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── JWT helpers ──────────────────────────────────────────────────────────────

export interface TokenPayload extends JWTPayload {
  userId: number;
  email: string;
}

export async function signToken(userId: number, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

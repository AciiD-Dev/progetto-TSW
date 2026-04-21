import bcrypt from 'bcryptjs';

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

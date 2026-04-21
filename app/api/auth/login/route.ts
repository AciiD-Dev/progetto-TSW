import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { loginSchema, validate } from '@/lib/validation';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const result = validate(rawBody, loginSchema);

    if (!result.valid) {
      return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
    }

    const { email, password } = rawBody;
    const db = getDb();
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken(user.id, user.email);
    
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

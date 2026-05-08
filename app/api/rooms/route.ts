import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { Room } from '@/types';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const db = getDb();
    const rooms = db.prepare('SELECT * FROM rooms WHERE user_id = ? ORDER BY id').all(userId) as Room[];
    return NextResponse.json(rooms);
  } catch (err) {
    console.error('[GET /api/rooms]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const rawBody = await request.json();
    if (!rawBody.name || !rawBody.icon) {
      return NextResponse.json({ error: 'Name and icon are required' }, { status: 400 });
    }

    const { name, icon } = rawBody;
    const db = getDb();
    const result = db.prepare('INSERT INTO rooms (user_id, name, icon) VALUES (?, ?, ?)').run(userId, name, icon);
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(room, { status: 201 });
  } catch (err) {
    console.error('[POST /api/rooms]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

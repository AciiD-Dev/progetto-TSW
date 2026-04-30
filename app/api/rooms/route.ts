import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { Room } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const rooms = db.prepare('SELECT * FROM rooms ORDER BY id').all() as Room[];
    return NextResponse.json(rooms);
  } catch (err) {
    console.error('[GET /api/rooms]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    if (!rawBody.name || !rawBody.icon) {
      return NextResponse.json({ error: 'Name and icon are required' }, { status: 400 });
    }

    const { name, icon } = rawBody;
    const db = getDb();
    const result = db.prepare('INSERT INTO rooms (name, icon) VALUES (?, ?)').run(name, icon);
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(room, { status: 201 });
  } catch (err) {
    console.error('[POST /api/rooms]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

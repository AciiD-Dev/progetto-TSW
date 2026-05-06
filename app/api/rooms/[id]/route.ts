import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json(room);
  } catch (err) {
    console.error('[GET /api/rooms/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, icon } = await request.json();
    
    const db = getDb();
    const existing = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as any;
    
    if (!existing) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const newName = name || existing.name;
    const newIcon = icon || existing.icon;

    db.prepare('UPDATE rooms SET name = ?, icon = ? WHERE id = ?').run(newName, newIcon, id);
    const updated = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/rooms/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/rooms/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const { id } = await params;
    const db = getDb();
    const room = db.prepare('SELECT * FROM rooms WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found or unauthorized' }, { status: 404 });
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
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const { id } = await params;
    const { name, icon } = await request.json();
    
    const db = getDb();
    const existing = db.prepare('SELECT * FROM rooms WHERE id = ? AND user_id = ?').get(id, userId) as any;
    
    if (!existing) {
      return NextResponse.json({ error: 'Room not found or unauthorized' }, { status: 404 });
    }

    const newName = name || existing.name;
    const newIcon = icon || existing.icon;

    db.prepare('UPDATE rooms SET name = ?, icon = ? WHERE id = ? AND user_id = ?').run(newName, newIcon, id, userId);
    const updated = db.prepare('SELECT * FROM rooms WHERE id = ? AND user_id = ?').get(id, userId);

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
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const { id } = await params;
    const db = getDb();

    // Check if room exists and belongs to user
    const existing = db.prepare('SELECT * FROM rooms WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return NextResponse.json({ error: 'Room not found or unauthorized' }, { status: 404 });
    }

    db.prepare('DELETE FROM rooms WHERE id = ? AND user_id = ?').run(id, userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/rooms/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

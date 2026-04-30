import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawBody = await request.json();
    
    const db = getDb();
    const existing = db.prepare('SELECT * FROM sequences WHERE id = ?').get(id) as any;
    
    if (!existing) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    const name = rawBody.name ?? existing.name;
    const description = rawBody.description ?? existing.description;
    const nodes = rawBody.nodes ? JSON.stringify(rawBody.nodes) : existing.nodes;
    const edges = rawBody.edges ? JSON.stringify(rawBody.edges) : existing.edges;
    const is_active = rawBody.is_active ?? existing.is_active;

    db.prepare(`
      UPDATE sequences 
      SET name = ?, description = ?, nodes = ?, edges = ?, is_active = ?
      WHERE id = ?
    `).run(name, description, nodes, edges, is_active, id);

    const updated = db.prepare('SELECT * FROM sequences WHERE id = ?').get(id) as any;
    return NextResponse.json({ ...updated, nodes: JSON.parse(updated.nodes), edges: JSON.parse(updated.edges) });
  } catch (err) {
    console.error('[PATCH /api/sequences/[id]]', err);
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
    db.prepare('DELETE FROM sequences WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/sequences/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

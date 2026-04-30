import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const sequences = db.prepare('SELECT * FROM sequences ORDER BY created_at DESC').all();
    return NextResponse.json(sequences);
  } catch (err) {
    console.error('[GET /api/sequences]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    if (!rawBody.name || !rawBody.nodes || !rawBody.edges) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { name, description = '', nodes, edges, is_active = 1 } = rawBody;
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO sequences (name, description, nodes, edges, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, description, JSON.stringify(nodes), JSON.stringify(edges), is_active);
    
    const seq = db.prepare('SELECT * FROM sequences WHERE id = ?').get(result.lastInsertRowid) as any;
    return NextResponse.json({ ...seq, nodes: JSON.parse(seq.nodes), edges: JSON.parse(seq.edges) }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/sequences]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { updateAlertSchema, validate } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawBody = await request.json();
    const result = validate(rawBody, updateAlertSchema);

    if (!result.valid) {
      return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
    }

    const db = getDb();
    
    // Check if alert exists
    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    db.prepare('UPDATE alerts SET is_active = ? WHERE id = ?').run(
      rawBody.is_active,
      id
    );

    const updated = db.prepare(`
      SELECT alerts.*, devices.name as device_name 
      FROM alerts 
      JOIN devices ON alerts.device_id = devices.id
      WHERE alerts.id = ?
    `).get(id);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/alerts/[id]]', err);
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
    db.prepare('DELETE FROM alerts WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/alerts/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

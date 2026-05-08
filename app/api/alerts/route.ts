import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { createAlertSchema, validate } from '@/lib/validation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const db = getDb();
    const alerts = db.prepare(`
      SELECT alerts.*, devices.name as device_name 
      FROM alerts 
      JOIN devices ON alerts.device_id = devices.id
      WHERE alerts.user_id = ?
      ORDER BY alerts.created_at DESC
    `).all(userId);
    return NextResponse.json(alerts);
  } catch (err) {
    console.error('[GET /api/alerts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const rawBody = await request.json();
    const result = validate(rawBody, createAlertSchema);

    if (!result.valid) {
      return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
    }

    const { device_id, rule_type, threshold, message } = rawBody;

    const db = getDb();
    const device = db.prepare('SELECT id FROM devices WHERE id = ? AND user_id = ?').get(device_id, userId);
    if (!device) {
      return NextResponse.json({ error: 'Device not found or unauthorized' }, { status: 404 });
    }

    const insertResult = db.prepare(`
      INSERT INTO alerts (user_id, device_id, rule_type, threshold, message, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(userId, device_id, rule_type, threshold, message);

    const alert = db.prepare(`
      SELECT alerts.*, devices.name as device_name 
      FROM alerts 
      JOIN devices ON alerts.device_id = devices.id
      WHERE alerts.id = ?
    `).get(insertResult.lastInsertRowid);

    return NextResponse.json(alert, { status: 201 });
  } catch (err) {
    console.error('[POST /api/alerts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

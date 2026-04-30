import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { createAlertSchema, validate } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const alerts = db.prepare(`
      SELECT alerts.*, devices.name as device_name 
      FROM alerts 
      JOIN devices ON alerts.device_id = devices.id
      ORDER BY alerts.created_at DESC
    `).all();
    return NextResponse.json(alerts);
  } catch (err) {
    console.error('[GET /api/alerts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const result = validate(rawBody, createAlertSchema);

    if (!result.valid) {
      return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
    }

    const { device_id, rule_type, threshold, message } = rawBody;

    const db = getDb();
    const device = db.prepare('SELECT id FROM devices WHERE id = ?').get(device_id);
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const insertResult = db.prepare(`
      INSERT INTO alerts (device_id, rule_type, threshold, message, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(device_id, rule_type, threshold, message);

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

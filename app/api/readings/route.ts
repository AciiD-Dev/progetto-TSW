import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { SensorReading, Device } from '@/types';
import { createReadingSchema, validate } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const range    = searchParams.get('range') ?? '24h';

    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    const hours = range === '7d' ? 7 * 24 : range === '30d' ? 30 * 24 : 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const db = getDb();
    const readings = db
      .prepare(
        `SELECT * FROM sensor_readings
         WHERE device_id = ? AND recorded_at >= ?
         ORDER BY recorded_at ASC`
      )
      .all(Number(deviceId), since) as SensorReading[];

    return NextResponse.json(readings);
  } catch (err) {
    console.error('[GET /api/readings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const result = validate(rawBody, createReadingSchema);

    if (!result.valid) {
      return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
    }

    const { device_id, value, unit } = rawBody;

    const db = getDb();
    
    // Check if device exists
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(device_id) as Device | undefined;
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const recordedAt = new Date().toISOString();
    
    const insertResult = db.prepare(
      'INSERT INTO sensor_readings (device_id, value, unit, recorded_at) VALUES (?, ?, ?, ?)'
    ).run(device_id, value, unit, recordedAt);

    // Update the device's current value
    db.prepare('UPDATE devices SET value = ? WHERE id = ?').run(value, device_id);

    const reading = db.prepare('SELECT * FROM sensor_readings WHERE id = ?').get(insertResult.lastInsertRowid);

    return NextResponse.json(reading, { status: 201 });
  } catch (err) {
    console.error('[POST /api/readings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

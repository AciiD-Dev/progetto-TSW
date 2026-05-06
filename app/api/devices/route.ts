import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { Device } from '@/types';
import { validate, deviceSchema, formatValidationErrors } from '@/lib/validation';
import { dbQueryLogger } from '@/lib/server/db-query-logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    const db = getDb();
    let devices: Device[];
    const startTime = Date.now();

    if (roomId) {
      const query = 'SELECT * FROM devices WHERE room_id = ? ORDER BY id';
      devices = db
        .prepare(query)
        .all(Number(roomId)) as Device[];
      dbQueryLogger.log(query, [Number(roomId)], Date.now() - startTime, devices.length, 'SELECT');
    } else {
      const query = 'SELECT * FROM devices ORDER BY id';
      devices = db.prepare(query).all() as Device[];
      dbQueryLogger.log(query, [], Date.now() - startTime, devices.length, 'SELECT');
    }

    return NextResponse.json(devices);
  } catch (err) {
    console.error('[GET /api/devices]', err);
    dbQueryLogger.log('SELECT * FROM devices', [], 0, 0, 'SELECT', String(err));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_id, name, type, value } = body;

    // Validazione lato server
    const validationResult = validate({ room_id, name, type, value }, deviceSchema);
    if (!validationResult.valid) {
      return NextResponse.json(formatValidationErrors(validationResult.errors), { status: 400 });
    }

    const db = getDb();
    const startTime = Date.now();
    const insertQuery = 'INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, 0, ?)';
    
    const result = db
      .prepare(insertQuery)
      .run(Number(room_id), String(name), String(type), Number(value ?? 0));

    dbQueryLogger.log(insertQuery, [Number(room_id), String(name), String(type), Number(value ?? 0)], Date.now() - startTime, 1, 'INSERT');

    const selectQuery = 'SELECT * FROM devices WHERE id = ?';
    const device = db.prepare(selectQuery).get(result.lastInsertRowid) as Device;
    dbQueryLogger.log(selectQuery, [result.lastInsertRowid], Date.now() - startTime, 1, 'SELECT');

    return NextResponse.json(device, { status: 201 });
  } catch (err) {
    console.error('[POST /api/devices]', err);
    dbQueryLogger.log('INSERT INTO devices', [], 0, 0, 'INSERT', String(err));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

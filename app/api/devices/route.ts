import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { Device } from '@/types';
import { validate, deviceSchema, formatValidationErrors } from '@/lib/validation';
import { dbQueryLogger } from '@/lib/server/db-query-logger';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    const db = getDb();
    let devices: Device[];
    const startTime = Date.now();

    if (roomId) {
      const query = 'SELECT * FROM devices WHERE user_id = ? AND room_id = ? ORDER BY id';
      devices = db
        .prepare(query)
        .all(userId, Number(roomId)) as Device[];
      dbQueryLogger.log(query, [userId, Number(roomId)], Date.now() - startTime, devices.length, 'SELECT');
    } else {
      const query = 'SELECT * FROM devices WHERE user_id = ? ORDER BY id';
      devices = db.prepare(query).all(userId) as Device[];
      dbQueryLogger.log(query, [userId], Date.now() - startTime, devices.length, 'SELECT');
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
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const body = await request.json();
    const { room_id, name, type, value } = body;

    // Validazione lato server
    const validationResult = validate({ room_id, name, type, value }, deviceSchema);
    if (!validationResult.valid) {
      return NextResponse.json(formatValidationErrors(validationResult.errors), { status: 400 });
    }

    const db = getDb();
    const startTime = Date.now();
    const insertQuery = 'INSERT INTO devices (user_id, room_id, name, type, status, value) VALUES (?, ?, ?, ?, 0, ?)';
    
    const result = db
      .prepare(insertQuery)
      .run(userId, Number(room_id), String(name), String(type), Number(value ?? 0));

    dbQueryLogger.log(insertQuery, [userId, Number(room_id), String(name), String(type), Number(value ?? 0)], Date.now() - startTime, 1, 'INSERT');

    const selectQuery = 'SELECT * FROM devices WHERE id = ? AND user_id = ?';
    const device = db.prepare(selectQuery).get(result.lastInsertRowid, userId) as Device;
    dbQueryLogger.log(selectQuery, [result.lastInsertRowid, userId], Date.now() - startTime, 1, 'SELECT');

    return NextResponse.json(device, { status: 201 });
  } catch (err) {
    console.error('[POST /api/devices]', err);
    dbQueryLogger.log('INSERT INTO devices', [], 0, 0, 'INSERT', String(err));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

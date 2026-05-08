import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { Device } from '@/types';
import { dbQueryLogger } from '@/lib/server/db-query-logger';

import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const { id } = await params;
    const body = await request.json();
    const db = getDb();
    const startTime = Date.now();

    // Validazione: verifica che il dispositivo esista
    const selectQuery = 'SELECT * FROM devices WHERE id = ? AND user_id = ?';
    const existing = db
      .prepare(selectQuery)
      .get(Number(id), userId) as Device | undefined;

    dbQueryLogger.log(selectQuery, [Number(id), userId], Date.now() - startTime, 1, 'SELECT');

    if (!existing) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Validazione: controlla i valori
    const newStatus = body.status !== undefined ? Number(body.status) : existing.status;
    const newValue  = body.value  !== undefined ? Number(body.value)  : existing.value;

    if (typeof newStatus !== 'number' || newStatus < 0 || newStatus > 1) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    if (typeof newValue !== 'number' || newValue < 0 || newValue > 100) {
      return NextResponse.json({ error: 'Invalid value (must be 0-100)' }, { status: 400 });
    }

    const updateStartTime = Date.now();
    const updateQuery = 'UPDATE devices SET status = ?, value = ? WHERE id = ? AND user_id = ?';
    db.prepare(updateQuery).run(newStatus, newValue, Number(id), userId);
    dbQueryLogger.log(updateQuery, [newStatus, newValue, Number(id), userId], Date.now() - updateStartTime, 1, 'UPDATE');

    const selectUpdatedQuery = 'SELECT * FROM devices WHERE id = ? AND user_id = ?';
    const updated = db
      .prepare(selectUpdatedQuery)
      .get(Number(id), userId) as Device;

    dbQueryLogger.log(selectUpdatedQuery, [Number(id), userId], Date.now() - updateStartTime, 1, 'SELECT');

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/devices/[id]]', err);
    dbQueryLogger.log('UPDATE devices', [], 0, 0, 'UPDATE', String(err));
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
    const startTime = Date.now();

    // Verifica che il dispositivo esista
    const selectQuery = 'SELECT * FROM devices WHERE id = ? AND user_id = ?';
    const existing = db.prepare(selectQuery).get(Number(id), userId) as Device | undefined;
    dbQueryLogger.log(selectQuery, [Number(id), userId], Date.now() - startTime, 1, 'SELECT');

    if (!existing) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const deleteStartTime = Date.now();
    const deleteReadingsQuery = 'DELETE FROM sensor_readings WHERE device_id = ?';
    db.prepare(deleteReadingsQuery).run(Number(id));
    dbQueryLogger.log(deleteReadingsQuery, [Number(id)], Date.now() - deleteStartTime, 1, 'DELETE');

    const deleteDeviceQuery = 'DELETE FROM devices WHERE id = ?';
    db.prepare(deleteDeviceQuery).run(Number(id));
    dbQueryLogger.log(deleteDeviceQuery, [Number(id)], Date.now() - deleteStartTime, 1, 'DELETE');

    return NextResponse.json({ success: true, message: 'Device deleted successfully' });
  } catch (err) {
    console.error('[DELETE /api/devices/[id]]', err);
    dbQueryLogger.log('DELETE FROM devices', [], 0, 0, 'DELETE', String(err));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

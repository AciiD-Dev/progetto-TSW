import { NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

interface LiveReading {
  device_id: number;
  value: number;
  unit: string;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const db = getDb();

    // Get all thermostat and humidity devices for the user
    const devices = db
      .prepare(`SELECT * FROM devices WHERE type IN ('thermostat', 'humidity') AND user_id = ?`)
      .all(userId) as Array<{ id: number; type: string; value: number }>;

    const results: LiveReading[] = devices.map((dev) => {
      // Get the latest reading for this device
      const latest = db
        .prepare(
          `SELECT value, unit FROM sensor_readings
           WHERE device_id = ?
           ORDER BY recorded_at DESC
           LIMIT 1`
        )
        .get(dev.id) as { value: number; unit: string } | undefined;

      const baseValue = latest?.value ?? dev.value;
      const unit      = latest?.unit  ?? (dev.type === 'thermostat' ? '°C' : '%');

      // Apply random delta
      const delta =
        dev.type === 'thermostat'
          ? (Math.random() - 0.5) * 1.0 // ±0.5
          : (Math.random() - 0.5) * 2.0; // ±1.0

      const value = parseFloat((baseValue + delta).toFixed(1));

      return { device_id: dev.id, value, unit };
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error('[GET /api/readings/live]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

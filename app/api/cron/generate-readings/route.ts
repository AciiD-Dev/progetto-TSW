import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { Device } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Protect with cron secret if in production and secret is set
  if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const db = getDb();
    const now = new Date().toISOString();
    const devices = db.prepare("SELECT * FROM devices WHERE type IN ('thermostat', 'humidity') AND status = 1").all() as Device[];
    
    console.log(`[cron] Found ${devices.length} active climate devices at ${now}`);
    let insertedCount = 0;

    const insertStmt = db.prepare('INSERT INTO sensor_readings (device_id, value, unit, recorded_at) VALUES (?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      for (const device of devices) {
        // The device.value is the user's setpoint — we generate a reading
        // that oscillates around it with small noise (±0.3°C or ±1%)
        const noise = device.type === 'thermostat'
          ? (Math.random() - 0.5) * 0.6   // ±0.3 °C
          : (Math.random() - 0.5) * 2.0;  // ±1 %

        let reading = device.value + noise;

        // Clamp to realistic bounds
        if (device.type === 'thermostat') {
          reading = Math.max(10, Math.min(35, reading));
        } else if (device.type === 'humidity') {
          reading = Math.max(10, Math.min(95, reading));
        }

        reading = parseFloat(reading.toFixed(1));
        const unit = device.type === 'thermostat' ? '°C' : '%';

        // Only insert the reading — do NOT update device.value (that's the user setpoint)
        insertStmt.run(device.id, reading, unit, now);
        insertedCount++;

        // Check alerts
        const activeAlerts = db.prepare("SELECT * FROM alerts WHERE device_id = ? AND is_active = 1").all(device.id) as any[];
        for (const alert of activeAlerts) {
          let triggered = false;
          if (alert.rule_type === 'gt' && reading > alert.threshold) triggered = true;
          if (alert.rule_type === 'lt' && reading < alert.threshold) triggered = true;
          
          if (triggered) {
            db.prepare('UPDATE alerts SET triggered_at = ? WHERE id = ?').run(now, alert.id);
          } else {
            // Reset triggered_at if condition is no longer met
            db.prepare('UPDATE alerts SET triggered_at = NULL WHERE id = ?').run(alert.id);
          }
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true, count: insertedCount });
  } catch (err) {
    console.error('[GET /api/cron/generate-readings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

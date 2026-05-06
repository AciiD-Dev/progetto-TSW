import { NextRequest } from 'next/server';
import getDb from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const sendUpdate = () => {
        try {
          const db = getDb();
          const readings = db.prepare(`
            SELECT r1.device_id, r1.value, r1.unit
            FROM sensor_readings r1
            JOIN (
              SELECT device_id, MAX(recorded_at) as max_time
              FROM sensor_readings
              GROUP BY device_id
            ) r2 ON r1.device_id = r2.device_id AND r1.recorded_at = r2.max_time
          `).all();

          // Also get active alerts count or triggered status if needed
          const alerts = db.prepare(`
            SELECT id FROM alerts WHERE is_active = 1 AND triggered_at IS NOT NULL
          `).all();

          const payload = {
            readings,
            activeAlerts: alerts.length
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (e) {
          console.error('[SSE Error]', e);
        }
      };

      sendUpdate();

      // Poll database for new data every 5 seconds and push to client
      const interval = setInterval(sendUpdate, 5000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

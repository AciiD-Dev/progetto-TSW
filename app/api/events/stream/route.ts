/**
 * GET /api/events/stream
 * Server-Sent Events (SSE) endpoint per aggiornamenti real-time.
 * Il client si connette e riceve aggiornamenti push dal server.
 */

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = Number(session.user.id);

  // Crea uno stream di risposta
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        // Invia il messaggio di connessione
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`
          )
        );

        // Aggiornamenti ogni 3 secondi
        let messageCount = 0;
        const interval = setInterval(() => {
          try {
            const db = getDb();

            // Carica i dati attuali filtrati per utente
            const devices = db
              .prepare('SELECT COUNT(*) as count FROM devices WHERE status = 1 AND user_id = ?')
              .get(userId) as { count: number };

            const avgTemp = db
              .prepare(
                `SELECT AVG(value) as avg_temp FROM devices 
                 WHERE type = 'thermostat' AND status = 1 AND user_id = ?`
              )
              .get(userId) as { avg_temp: number | null };

            const avgHumidity = db
              .prepare(
                `SELECT AVG(value) as avg_humidity FROM devices 
                 WHERE type = 'humidity' AND status = 1 AND user_id = ?`
              )
              .get(userId) as { avg_humidity: number | null };

            const activeAlerts = db
              .prepare('SELECT COUNT(*) as count FROM alerts WHERE is_active = 1 AND triggered_at IS NOT NULL AND user_id = ?')
              .get(userId) as { count: number };

            messageCount++;

            // Invia l'aggiornamento
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'update',
                  timestamp: new Date().toISOString(),
                  data: {
                    activeDevices: devices.count,
                    avgTemperature: avgTemp.avg_temp ? Math.round(avgTemp.avg_temp * 10) / 10 : null,
                    avgHumidity: avgHumidity.avg_humidity ? Math.round(avgHumidity.avg_humidity * 10) / 10 : null,
                    activeAlerts: activeAlerts.count,
                  },
                  messageNumber: messageCount,
                })}\n\n`
              )
            );

            // Chiudi la connessione dopo ~60 secondi (max 20 messaggi)
            if (messageCount >= 20) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'closed', reason: 'max_duration_reached' })}\n\n`
                )
              );
              clearInterval(interval);
              controller.close();
            }
          } catch (err) {
            console.error('[SSE] Error in interval:', err);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', error: String(err) })}\n\n`
              )
            );
          }
        }, 3000);

        // Cleanup quando il client si disconnette
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      } catch (err) {
        console.error('[SSE] Error:', err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', error: String(err) })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

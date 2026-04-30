/**
 * GET /api/debug/query-logs
 * Ritorna i log delle query eseguite sul database.
 * Utile per debugging e per mostrare l'interazione client-server.
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbQueryLogger } from '@/lib/server/db-query-logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // In production, questo endpoint dovrebbe essere protetto
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? '50');
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      return NextResponse.json({
        stats: dbQueryLogger.getStats(),
        logs: dbQueryLogger.getLogs(limit),
      });
    }

    return NextResponse.json({
      logs: dbQueryLogger.getLogs(limit),
    });
  } catch (err) {
    console.error('[GET /api/debug/query-logs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    dbQueryLogger.clearLogs();
    return NextResponse.json({ message: 'Query logs cleared' });
  } catch (err) {
    console.error('[DELETE /api/debug/query-logs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

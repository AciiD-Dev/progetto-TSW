/**
 * POST /api/devices/batch
 * Esegue operazioni in batch su più dispositivi.
 * Utile per dimostrare ottimizzazione e transazioni.
 */

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import { dbQueryLogger } from '@/lib/server/db-query-logger';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

interface BatchOperation {
  device_id: number;
  action: 'toggle' | 'turn_on' | 'turn_off' | 'set_value';
  value?: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = Number(session.user.id);

    const body = await request.json();
    const { operations } = body as { operations: BatchOperation[] };

    // Validazione
    if (!Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json(
        { error: 'Operations array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (operations.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 operations per batch' },
        { status: 400 }
      );
    }

    const db = getDb();
    const startTime = Date.now();
    const results: any[] = [];
    const errors: any[] = [];

    // Esegui le operazioni in transazione
    const transaction = db.transaction(() => {
      for (const op of operations) {
        try {
          // Verifica che il dispositivo esista e appartenga all'utente
          const selectQuery = 'SELECT * FROM devices WHERE id = ? AND user_id = ?';
          const device = db.prepare(selectQuery).get(op.device_id, userId);

          if (!device) {
            errors.push({
              device_id: op.device_id,
              error: 'Device not found',
            });
            continue;
          }

          let newStatus = (device as any).status;
          let newValue = (device as any).value;

          // Applica l'azione
          switch (op.action) {
            case 'toggle':
              newStatus = newStatus ? 0 : 1;
              break;
            case 'turn_on':
              newStatus = 1;
              break;
            case 'turn_off':
              newStatus = 0;
              break;
            case 'set_value':
              if (op.value !== undefined) {
                newValue = op.value;
              }
              break;
          }

          // Aggiorna il dispositivo
          const updateQuery = 'UPDATE devices SET status = ?, value = ? WHERE id = ? AND user_id = ?';
          db.prepare(updateQuery).run(newStatus, newValue, op.device_id, userId);

          results.push({
            device_id: op.device_id,
            action: op.action,
            status: newStatus,
            value: newValue,
            success: true,
          });
        } catch (err) {
          errors.push({
            device_id: op.device_id,
            error: String(err),
          });
        }
      }
    });

    // Esegui la transazione
    transaction();

    dbQueryLogger.log(
      `BATCH UPDATE: ${operations.length} operations`,
      operations,
      Date.now() - startTime,
      results.length,
      'UPDATE'
    );

    return NextResponse.json({
      success: errors.length === 0,
      results,
      errors,
      operationsCount: operations.length,
      successCount: results.length,
      errorCount: errors.length,
    });
  } catch (err) {
    console.error('[POST /api/devices/batch]', err);
    dbQueryLogger.log('BATCH UPDATE', [], 0, 0, 'UPDATE', String(err));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Database Query Logger
 * Tracks all executed SQL queries, execution times and results.
 */

import type { QueryLog, QueryType } from '@/types';
export type { QueryLog };

class DatabaseQueryLogger {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  log(query: string, params: any[], duration: number, rowsAffected: number, type: QueryType, error?: string) {
    // Logging completely disabled
  }

  getLogs(): QueryLog[] {
    return [];
  }

  getLogsSince(): QueryLog[] {
    return [];
  }

  clearLogs() {
  }

  getStats() {
    return {
      totalQueries: 0,
      byType: { SELECT: 0, INSERT: 0, UPDATE: 0, DELETE: 0 },
      avgDuration: 0,
      errors: 0,
    };
  }
}

export const dbQueryLogger = new DatabaseQueryLogger();

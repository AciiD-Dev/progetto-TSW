/**
 * Database Query Logger
 * Tracks all executed SQL queries, execution times and results.
 */

import type { QueryLog, QueryType } from '@/types';
export type { QueryLog };

class DatabaseQueryLogger {
  private logs: QueryLog[] = [];
  private maxLogs = 500;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(query: string, params: any[], duration: number, rowsAffected: number, type: QueryType, error?: string) {
    const entry: QueryLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      query,
      params,
      duration,
      rowsAffected,
      type,
      error,
    };

    this.logs.push(entry);

    // Mantieni solo gli ultimi maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log in console in development
    if (process.env.NODE_ENV === 'development') {
      const color = error ? '\x1b[31m' : '\x1b[36m'; // rosso se errore, cyan se ok
      const reset = '\x1b[0m';
      console.log(
        `${color}[DB] ${type} (${duration}ms)${reset} ${query.substring(0, 80)}${query.length > 80 ? '...' : ''}`
      );
    }
  }

  getLogs(limit: number = 50): QueryLog[] {
    return this.logs.slice(-limit);
  }

  getLogsSince(timestamp: string): QueryLog[] {
    return this.logs.filter(log => new Date(log.timestamp) > new Date(timestamp));
  }

  clearLogs() {
    this.logs = [];
  }

  getStats() {
    return {
      totalQueries: this.logs.length,
      byType: {
        SELECT: this.logs.filter(l => l.type === 'SELECT').length,
        INSERT: this.logs.filter(l => l.type === 'INSERT').length,
        UPDATE: this.logs.filter(l => l.type === 'UPDATE').length,
        DELETE: this.logs.filter(l => l.type === 'DELETE').length,
      },
      avgDuration: this.logs.length > 0 ? Math.round(this.logs.reduce((sum, l) => sum + l.duration, 0) / this.logs.length) : 0,
      errors: this.logs.filter(l => l.error).length,
    };
  }
}

export const dbQueryLogger = new DatabaseQueryLogger();

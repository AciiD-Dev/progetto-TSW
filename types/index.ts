// ── Editor / Sequence types ──────────────────────────────────────────────────

export type NodeType = 'trigger' | 'ai' | 'action' | 'notification';

export interface SequenceStep {
  id: string;
  type: NodeType;
  title: string;
  icon: string;
  badge?: string;
  description: string;
  /** Whether to highlight this step with a focus ring */
  isActive?: boolean;
}

// ── Device & Room types ──────────────────────────────────────────────────────

export type DeviceType = 'light' | 'thermostat' | 'humidity' | 'blinds' | 'plug';

export interface Room {
  id: number;
  name: string;
  icon: string;
}

export interface Device {
  id: number;
  room_id: number;
  name: string;
  type: DeviceType;
  status: number;
  value: number;
}

// ── Sensor readings ──────────────────────────────────────────────────────────

export interface SensorReading {
  id: number;
  device_id: number;
  value: number;
  unit: string;
  recorded_at: string;
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export type AlertRuleType = 'gt' | 'lt';

export interface Alert {
  id: number;
  device_id: number;
  rule_type: AlertRuleType;
  threshold: number;
  message: string;
  is_active: number; // 0 | 1 (SQLite boolean)
  created_at: string;
  triggered_at: string | null;
}

// ── Sequences (Automation) ───────────────────────────────────────────────────

export interface Sequence {
  id: number;
  name: string;
  description: string | null;
  nodes: string; // JSON-serialized node array
  edges: string; // JSON-serialized edge array
  is_active: number; // 0 | 1 (SQLite boolean)
  created_at: string;
}

// ── DB query logger (debug) ──────────────────────────────────────────────────

export type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'EXEC';

export interface QueryLog {
  id: string;
  timestamp: string;
  query: string;
  params: unknown[];
  duration: number; // ms
  rowsAffected: number;
  type: QueryType;
  error?: string;
}


/**
 * better-sqlite3 singleton for HomeHub.
 *
 * LOCAL DEV:  reads/writes  <project-root>/homedb.sqlite
 *
 * VERCEL PRODUCTION:
 *   Vercel's filesystem is read-only except for /tmp.
 *   Strategy: bundle the pre-seeded homedb.sqlite in the repo,
 *   then copy it to /tmp/homedb.sqlite on the first cold-start.
 *   All subsequent requests on the same function instance reuse /tmp.
 *   Writes (device toggles etc.) work within a single invocation;
 *   /tmp is ephemeral across different function instances, which is
 *   acceptable for a demo app whose source of truth is the seeded data.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const IS_PROD = process.env.NODE_ENV === 'production';

// In production, Vercel includes files from the repo root in the bundle
// at process.cwd() (which maps to /var/task on AWS Lambda).
const BUNDLE_DB = path.join(process.cwd(), 'homedb.sqlite');
const TMP_DB    = '/tmp/homedb.sqlite';

function resolveDbPath(): string {
  if (!IS_PROD) return BUNDLE_DB;          // dev: use local file directly

  // Production: copy the pre-seeded DB to /tmp if not already there
  if (!fs.existsSync(TMP_DB)) {
    if (fs.existsSync(BUNDLE_DB)) {
      fs.copyFileSync(BUNDLE_DB, TMP_DB);
      console.log('[db] Copied homedb.sqlite → /tmp/homedb.sqlite');
    } else {
      // Fallback: create an empty DB (will have no data, but won't crash)
      console.warn('[db] homedb.sqlite not found in bundle — creating empty DB');
    }
  }

  return TMP_DB;
}

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dbPath = resolveDbPath();
  const _db = new Database(dbPath);
  db = _db;
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Ensure tables exist (idempotent — safe to run even on pre-seeded DB)
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    NOT NULL UNIQUE,
      name          TEXT    NOT NULL,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT    NOT NULL,
      icon TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS devices (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      name    TEXT    NOT NULL,
      type    TEXT    NOT NULL,
      status  INTEGER NOT NULL DEFAULT 0,
      value   REAL    NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sensor_readings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id   INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      value       REAL    NOT NULL,
      unit        TEXT    NOT NULL,
      recorded_at TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id    INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      rule_type    TEXT    NOT NULL CHECK(rule_type IN ('gt', 'lt')),
      threshold    REAL    NOT NULL,
      message      TEXT    NOT NULL,
      is_active    INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      triggered_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sequences (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      nodes       TEXT NOT NULL,
      edges       TEXT NOT NULL,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Seed default admin user ─────────────────────────────────────────────
  const userCount = _db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    // Hash for 'password123'  (bcrypt native, rounds=10)
    const defaultHash = '$2b$10$9id7CE.DrcXr5ezBG1FZJOEg3iVmQ.ZhhIKodeaOjDCP./KqC4jaS';
    _db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)')
      .run('admin@home.local', 'Admin', defaultHash);
  }

  // ── Seed demo rooms + devices (only when rooms table is empty) ───────────
  const roomCount = _db.prepare('SELECT COUNT(*) as count FROM rooms').get() as { count: number };
  if (roomCount.count === 0) {
    _db.transaction(() => {
      // Rooms
      const r1 = _db.prepare('INSERT INTO rooms (name, icon) VALUES (?, ?)').run('Living Room',  'chair');
      const r2 = _db.prepare('INSERT INTO rooms (name, icon) VALUES (?, ?)').run('Bedroom',      'bed');
      const r3 = _db.prepare('INSERT INTO rooms (name, icon) VALUES (?, ?)').run('Kitchen',      'kitchen');
      const r4 = _db.prepare('INSERT INTO rooms (name, icon) VALUES (?, ?)').run('Office',       'computer');

      // Living room devices
      const d1 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r1.lastInsertRowid, 'Ceiling Light',   'light',      1, 80);
      const d2 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r1.lastInsertRowid, 'Smart Thermostat', 'thermostat', 1, 21.5);
      const d3 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r1.lastInsertRowid, 'Humidity Sensor',  'humidity',   1, 52);

      // Bedroom devices
      const d4 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r2.lastInsertRowid, 'Bedside Lamp',    'light',      0, 40);
      const d5 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r2.lastInsertRowid, 'AC Thermostat',   'thermostat', 1, 20.0);
      const d6 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r2.lastInsertRowid, 'Window Blind',    'blinds',     0, 30);

      // Kitchen devices
      const d7 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r3.lastInsertRowid, 'Kitchen Light',   'light',      1, 100);
      const d8 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r3.lastInsertRowid, 'Humidity Sensor', 'humidity',   1, 61);

      // Office devices
      const d9  = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r4.lastInsertRowid, 'Desk Lamp',        'light',      1, 60);
      const d10 = _db.prepare('INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)').run(r4.lastInsertRowid, 'Office Thermostat', 'thermostat', 1, 22.0);

      // Unused variable suppression (TS strict)
      void d1; void d4; void d6; void d7; void d9;

      // Seed 48h of sensor readings for thermostat + humidity devices
      const sensorDevices = [
        { id: d2.lastInsertRowid as number, unit: '°C', base: 21.5, range: 2.5 },
        { id: d3.lastInsertRowid as number, unit: '%',  base: 52,   range: 8   },
        { id: d5.lastInsertRowid as number, unit: '°C', base: 20.0, range: 2.0 },
        { id: d8.lastInsertRowid as number, unit: '%',  base: 61,   range: 10  },
        { id: d10.lastInsertRowid as number, unit: '°C', base: 22.0, range: 1.5 },
      ];

      const now = Date.now();
      const INSERT_READING = _db.prepare(
        'INSERT INTO sensor_readings (device_id, value, unit, recorded_at) VALUES (?, ?, ?, ?)'
      );

      for (const sensor of sensorDevices) {
        // One reading every 30 min for past 48 hours = 97 readings per device
        for (let i = 96; i >= 0; i--) {
          const ts  = new Date(now - i * 30 * 60 * 1000).toISOString();
          // Sine-wave variation so charts look realistic
          const val = sensor.base
            + Math.sin(i * 0.3) * sensor.range * 0.5
            + (Math.random() - 0.5) * sensor.range * 0.3;
          INSERT_READING.run(sensor.id, Math.round(val * 10) / 10, sensor.unit, ts);
        }
      }
    })();

    console.log('[db] Demo seed inserted: 4 rooms, 10 devices, ~485 sensor readings');
  }

  return _db;
}

export default getDb;

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'homedb.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create all tables (must match lib/server/db.ts exactly) ───────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    NOT NULL UNIQUE,
    name          TEXT    NOT NULL,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name    TEXT    NOT NULL,
    icon    TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS devices (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
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
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    nodes       TEXT NOT NULL,
    edges       TEXT NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    message     TEXT    NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── Idempotent: clear all data AND reset auto-increment counters ──────────────
db.exec(`
  DELETE FROM sensor_readings;
  DELETE FROM notifications;
  DELETE FROM alerts;
  DELETE FROM sequences;
  DELETE FROM devices;
  DELETE FROM rooms;
  DELETE FROM users;
  DELETE FROM sqlite_sequence;
`);

// ── Seed default admin user ───────────────────────────────────────────────────
// Hash for 'password123' (bcryptjs, rounds=10)
const defaultHash = '$2b$10$9id7CE.DrcXr5ezBG1FZJOEg3iVmQ.ZhhIKodeaOjDCP./KqC4jaS';
db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)')
  .run('admin@home.local', 'Admin', defaultHash);

const adminUserId = 1;

// ─── Rooms ────────────────────────────────────────────────────────────────────
const insertRoom = db.prepare('INSERT INTO rooms (user_id, name, icon) VALUES (?, ?, ?)');

const rooms = [
  { name: 'Living Room', icon: 'chair' },
  { name: 'Bedroom',     icon: 'bed' },
  { name: 'Kitchen',     icon: 'kitchen' },
  { name: 'Office',      icon: 'computer' },
];

const roomIds: number[] = [];
for (const r of rooms) {
  const result = insertRoom.run(adminUserId, r.name, r.icon);
  roomIds.push(result.lastInsertRowid as number);
}

// ─── Devices per room ─────────────────────────────────────────────────────────
const insertDevice = db.prepare(
  'INSERT INTO devices (user_id, room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?, ?)'
);

interface DeviceSeed {
  name: string;
  type: string;
  status: number;
  value: number;
}

const roomDevices: DeviceSeed[][] = [
  // Living Room
  [
    { name: 'Ceiling Light',   type: 'light',      status: 1, value: 80 },
    { name: 'Smart Thermostat', type: 'thermostat', status: 1, value: 21.5 },
    { name: 'Humidity Sensor',  type: 'humidity',   status: 1, value: 52 },
  ],
  // Bedroom
  [
    { name: 'Bedside Lamp',  type: 'light',      status: 0, value: 40 },
    { name: 'AC Thermostat', type: 'thermostat', status: 1, value: 20.0 },
    { name: 'Window Blind',  type: 'blinds',     status: 0, value: 30 },
  ],
  // Kitchen
  [
    { name: 'Kitchen Light',   type: 'light',    status: 1, value: 100 },
    { name: 'Humidity Sensor', type: 'humidity',  status: 1, value: 61 },
  ],
  // Office
  [
    { name: 'Desk Lamp',         type: 'light',      status: 1, value: 60 },
    { name: 'Office Thermostat', type: 'thermostat', status: 1, value: 22.0 },
  ],
];

// ─── Sensor readings (48h, every 30 min) ──────────────────────────────────────
const insertReading = db.prepare(
  'INSERT INTO sensor_readings (device_id, value, unit, recorded_at) VALUES (?, ?, ?, ?)'
);

const now = Date.now();
const THIRTY_MIN = 30 * 60 * 1000;

for (let ri = 0; ri < roomIds.length; ri++) {
  const roomId = roomIds[ri];
  for (const dev of roomDevices[ri]) {
    const res = insertDevice.run(adminUserId, roomId, dev.name, dev.type, dev.status, dev.value);
    const deviceId = res.lastInsertRowid as number;

    if (dev.type === 'thermostat' || dev.type === 'humidity') {
      const unit  = dev.type === 'thermostat' ? '°C' : '%';
      const base  = dev.value;
      const range = dev.type === 'thermostat' ? 2.5 : 8;

      // One reading every 30 min for past 48 hours = 97 readings per device
      for (let i = 96; i >= 0; i--) {
        const ts = new Date(now - i * THIRTY_MIN).toISOString();
        // Sine-wave variation so charts look realistic
        const val = base
          + Math.sin(i * 0.3) * range * 0.5
          + (Math.random() - 0.5) * range * 0.3;
        insertReading.run(deviceId, Math.round(val * 10) / 10, unit, ts);
      }
    }
  }
}

console.log('✅ Database seeded successfully: 1 user, 4 rooms, 10 devices, ~485 sensor readings');
db.close();

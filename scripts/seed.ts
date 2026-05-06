import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'homedb.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Ensure tables exist
db.exec(`
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
`);

// Idempotent: clear all data AND reset auto-increment counters
// so device/room IDs always restart from 1 on every seed run
db.exec(`
  DELETE FROM sensor_readings;
  DELETE FROM devices;
  DELETE FROM rooms;
  DELETE FROM sqlite_sequence WHERE name IN ('rooms', 'devices', 'sensor_readings');
`);

// ─── Rooms ────────────────────────────────────────────────────────────────────
const insertRoom = db.prepare('INSERT INTO rooms (name, icon) VALUES (?, ?)');

const rooms = [
  { name: 'Living Room', icon: 'living' },
  { name: 'Kitchen', icon: 'kitchen' },
  { name: 'Bedroom', icon: 'bed' },
  { name: 'Bathroom', icon: 'bathroom' },
  { name: 'Garden', icon: 'yard' },
];

const roomIds: number[] = [];
for (const r of rooms) {
  const result = insertRoom.run(r.name, r.icon);
  roomIds.push(result.lastInsertRowid as number);
}

// ─── Devices per room ─────────────────────────────────────────────────────────
const insertDevice = db.prepare(
  'INSERT INTO devices (room_id, name, type, status, value) VALUES (?, ?, ?, ?, ?)'
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
    { name: 'Ceiling Light', type: 'light', status: 1, value: 80 },
    { name: 'Floor Lamp', type: 'light', status: 0, value: 60 },
    { name: 'Thermostat', type: 'thermostat', status: 1, value: 22 },
    { name: 'Humidity Sensor', type: 'humidity', status: 1, value: 52 },
  ],
  // Kitchen
  [
    { name: 'Kitchen Light', type: 'light', status: 1, value: 100 },
    { name: 'Under Cabinet', type: 'light', status: 0, value: 40 },
    { name: 'Humidity Sensor', type: 'humidity', status: 1, value: 58 },
    { name: 'Roller Blinds', type: 'blinds', status: 0, value: 100 },
  ],
  // Bedroom
  [
    { name: 'Bedside Lamp', type: 'light', status: 0, value: 30 },
    { name: 'Ceiling Light', type: 'light', status: 0, value: 70 },
    { name: 'Thermostat', type: 'thermostat', status: 1, value: 20 },
    { name: 'Humidity Sensor', type: 'humidity', status: 1, value: 45 },
  ],
  // Bathroom
  [
    { name: 'Mirror Light', type: 'light', status: 1, value: 100 },
    { name: 'Ceiling Light', type: 'light', status: 0, value: 100 },
    { name: 'Humidity Sensor', type: 'humidity', status: 1, value: 65 },
  ],
  // Garden
  [
    { name: 'Garden Lights', type: 'light', status: 1, value: 100 },
    { name: 'Path Lights', type: 'light', status: 0, value: 100 },
    { name: 'Irrigation Blinds', type: 'blinds', status: 0, value: 0 },
    { name: 'Humidity Sensor', type: 'humidity', status: 1, value: 55 },
  ],
];

// ─── Sensor readings (48h, hourly) ────────────────────────────────────────────
const insertReading = db.prepare(
  'INSERT INTO sensor_readings (device_id, value, unit, recorded_at) VALUES (?, ?, ?, ?)'
);

const now = Date.now();
const ONE_HOUR = 60 * 60 * 1000;

for (let ri = 0; ri < roomIds.length; ri++) {
  const roomId = roomIds[ri];
  for (const dev of roomDevices[ri]) {
    const res = insertDevice.run(roomId, dev.name, dev.type, dev.status, dev.value);
    const deviceId = res.lastInsertRowid as number;

    if (dev.type === 'thermostat' || dev.type === 'humidity') {
      const unit = dev.type === 'thermostat' ? '°C' : '%';
      const base = dev.value as number;
      const range = dev.type === 'thermostat' ? 3 : 8;

      for (let h = 47; h >= 0; h--) {
        const ts = new Date(now - h * ONE_HOUR).toISOString();
        // Realistic variation: sine-like drift + small random noise
        const drift = Math.sin((47 - h) / 12 * Math.PI) * (range / 2);
        const noise = (Math.random() - 0.5) * 2;
        const value = parseFloat((base + drift + noise).toFixed(1));
        insertReading.run(deviceId, value, unit, ts);
      }
    }
  }
}

console.log('✅ Database seeded successfully');
db.close();

import { auth } from "@/auth";
import getDb from "@/lib/server/db";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const userId = parseInt(session.user.id);

    // Delete all user data explicitly inside a transaction to guarantee complete removal
    // even if PRAGMA foreign_keys CASCADE is not active or fails.
    const deleteTransaction = db.transaction(() => {
      // Alerts, Notifications, Sequences
      db.prepare('DELETE FROM notifications WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM sequences WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM alerts WHERE user_id = ?').run(userId);
      
      // Sensor readings linked to user's devices
      db.prepare(`
        DELETE FROM sensor_readings 
        WHERE device_id IN (SELECT id FROM devices WHERE user_id = ?)
      `).run(userId);
      
      // Devices and Rooms
      db.prepare('DELETE FROM devices WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM rooms WHERE user_id = ?').run(userId);
      
      // Finally, delete the user
      const res = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      return res;
    });

    const result = deleteTransaction();

    if (result.changes === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/auth/delete-account] Error:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    // Delete user (cascading will handle rooms, devices, alerts, etc.)
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    if (result.changes === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/auth/delete-account] Error:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

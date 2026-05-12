import { auth } from "@/auth";
import getDb from "@/lib/server/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getDb();
    const userId = parseInt(session.user.id);

    // Get user from DB
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as { password_hash: string } | undefined;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Google users might not have a password_hash
    if (!user.password_hash) {
      return NextResponse.json({ error: "OAuth users cannot change password this way" }, { status: 400 });
    }

    // Verify old password
    const passwordsMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!passwordsMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // Check if new password is same as old
    const isSameAsOld = await bcrypt.compare(newPassword, user.password_hash);
    if (isSameAsOld) {
      return NextResponse.json({ error: "New password must be different from the current one" }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update DB
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedNewPassword, userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/auth/change-password] Error:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

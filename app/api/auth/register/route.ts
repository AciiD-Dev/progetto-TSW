import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/server/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatori' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La password deve avere almeno 6 caratteri' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = getDb();

    // Controlla se l'utente esiste già (sia registrato con credenziali che con Google)
    const existingUser = db.prepare('SELECT id, password_hash FROM users WHERE LOWER(email) = ?').get(normalizedEmail) as { id: number, password_hash: string } | undefined;

    if (existingUser) {
      if (existingUser.password_hash === '') {
        // L'utente esiste via Google OAuth — aggiungi la password per permettere
        // anche il login con credenziali (link account)
        const passwordHash = await bcrypt.hash(password, 10);
        db.prepare("UPDATE users SET password_hash = ?, name = COALESCE(NULLIF(?, ''), name) WHERE id = ?").run(
          passwordHash,
          name || '',
          existingUser.id
        );
        return NextResponse.json(
          { success: true, message: 'Password aggiunta al tuo account Google' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Un account con questa email esiste già' },
        { status: 409 }
      );
    }

    // Hash della password e inserimento nuovo utente
    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(
      normalizedEmail,
      passwordHash,
      name || 'New User'
    );

    return NextResponse.json(
      { success: true, message: 'Utente creato con successo' },
      { status: 201 }
    );

  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
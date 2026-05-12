import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import getDb from "@/lib/server/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = getDb();
        const normalizedEmail = (credentials.email as string).trim().toLowerCase();
        const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail) as { id: number, email: string, name: string, password_hash: string } | undefined;

        if (!user || !user.password_hash) return null;

        console.log('[auth:authorize] Comparing password for:', normalizedEmail);
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );
        console.log('[auth:authorize] Password match result:', passwordsMatch);

        if (passwordsMatch) {
          return { id: user.id.toString(), email: user.email, name: user.name };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 ore
  },
  callbacks: {
    /**
     * Handle Google OAuth sign-in:
     * Auto-create a local user row when a Google user signs in for the first time.
     */
    async signIn({ user, account }) {
      console.log('[auth:signIn] provider =', account?.provider, '| email =', user.email);
      if (account?.provider === "google") {
        try {
          const db = getDb();
          const normalizedEmail = (user.email ?? "").trim().toLowerCase();
          if (!normalizedEmail) return false;

          const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail) as { id: number } | undefined;

          if (!existingUser) {
            db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)').run(
              normalizedEmail,
              user.name || 'Google User',
              '' // Google users have no password
            );
            console.log('[auth:signIn] ✅ Created DB user for Google:', normalizedEmail);
          } else {
            console.log('[auth:signIn] User already exists in DB, id:', existingUser.id);
          }
        } catch (err) {
          console.error('[auth:signIn] ❌ Error creating Google user:', err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        console.log('[auth:jwt] Processing user login for:', user.email);
        const db = getDb();
        const normalizedEmail = ((user.email ?? token.email) as string ?? "").trim().toLowerCase();
        const dbUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail) as { id: number } | undefined;
        token.id = dbUser ? dbUser.id.toString() : user.id;
        token.name = user.name;
        console.log('[auth:jwt] Token prepared, id:', token.id);
      }
      return token;
    },

    async session({ session, token }) {
      console.log('[auth:session] Session requested for token id:', token?.id);
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    }
  }
});
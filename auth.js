import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Auth.js v5 — admin console authentication.
 *
 * Two prototype accounts back the role demo (same as before):
 *   admin / admin → owner (sees everything)
 *   staff / staff → staff (限定的)
 *
 * Replace this list with a DB lookup + bcrypt hash before going live.
 * Each session carries `user.role` which AdminApp uses to filter the
 * sidebar and gate write actions.
 *
 * Env:
 *   AUTH_SECRET — required in production. Set it in Vercel → Project
 *                 Settings → Environment Variables. `openssl rand -hex 32`.
 */
const ACCOUNTS = [
  { user: "admin", pass: "admin", role: "owner", name: "オーナー (admin)" },
  { user: "staff", pass: "staff", role: "staff", name: "スタッフ (staff)" },
];

export const { auth, signIn, signOut, handlers } = NextAuth({
  // Vercel auto-detects its own hostname; for any non-Vercel deploy we
  // trust the configured host (single-app deployment), which keeps
  // /api/auth/* working under custom domains too.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        user: { label: "User" },
        pass: { label: "Pass", type: "password" },
      },
      async authorize(credentials) {
        const acc = ACCOUNTS.find(
          (a) => a.user === credentials?.user && a.pass === credentials?.pass
        );
        if (!acc) return null;
        return { id: acc.user, name: acc.name, role: acc.role };
      },
    }),
  ],
  pages: {
    // We render the sign-in form inside /admin itself, so requests to
    // the framework default `/api/auth/signin` redirect home.
    signIn: "/admin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.name = token.name;
      }
      return session;
    },
  },
});

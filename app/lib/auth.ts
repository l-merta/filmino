import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials (username/email + password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "your username or email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Try to find user by username or email
        const user = await prisma.users.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.username = token.username as string;
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.username = user.username;
      }
      // The client calls `update()` after the user changes their username or
      // e-mail in settings, so we reload the fresh values from the database.
      if (trigger === "update" && token.sub) {
        const fresh = await prisma.users.findUnique({ where: { id: token.sub } });
        if (fresh) {
          token.username = fresh.username;
          token.email = fresh.email;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/prihlaseni',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** Returns the logged in user's id, or null for anonymous visitors. */
export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

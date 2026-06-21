import "server-only";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: "user",
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Find database user by email
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email as string },
          select: { id: true, role: true, name: true, image: true, email: true },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
          token.role = dbUser.role;
        } else {
          token.sub = user.id;
          token.name = user.name;
          token.email = user.email;
          token.picture = user.image;
          token.role = "user";
        }
      } else if (token.sub && !token.role) {
        // Token exists but no role — fetch from DB as fallback
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub;
      if (token.name) session.user.name = token.name as string;
      if (token.email) session.user.email = token.email as string;
      if (token.picture) session.user.image = token.picture as string;
      if (session.user) {
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});

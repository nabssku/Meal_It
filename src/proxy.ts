import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Lightweight proxy for route protection.
 * Uses authConfig which has NO database imports — safe for middleware/edge context.
 * The full auth (with Credentials + Google providers) is in auth.ts (server-only).
 */
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
    ],
};

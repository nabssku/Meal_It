import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Next.js 16+ proxy (replaces middleware.ts).
 * Uses authConfig (no DB imports) — safe for Edge runtime.
 * config.matcher MUST be defined here to exclude /api/auth/* from interception.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
    matcher: [
        /*
         * Match all paths EXCEPT:
         * - _next/static  (Next.js static assets)
         * - _next/image   (Next.js image optimization)
         * - favicon.ico
         * - public/       (static public files)
         * - api/auth/     (NextAuth's own API routes — MUST be excluded!)
         */
        "/((?!_next/static|_next/image|favicon\\.ico|public/|api/auth/).*)",
    ],
};

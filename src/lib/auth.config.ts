import type { NextAuthConfig } from "next-auth";

/**
 * Lightweight auth config — NO database imports.
 * Used by proxy.ts (middleware) to check JWT sessions
 * without loading Prisma or any Node.js-only packages.
 */
export const authConfig: NextAuthConfig = {
    providers: [],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const protectedPaths = [
                "/dashboard",
                "/profile",
                "/meal-planner",
                "/wallet",
                "/history",
                "/menus",
                "/vendors",
                "/profile-setup",
            ];
            const isProtected = protectedPaths.some((p) =>
                nextUrl.pathname.startsWith(p)
            );

            if (isProtected && !isLoggedIn) {
                return Response.redirect(new URL("/login", nextUrl));
            }
            return true;
        },
    },
};

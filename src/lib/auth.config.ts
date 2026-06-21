import type { NextAuthConfig } from "next-auth";

/**
 * Lightweight auth config — NO database imports.
 * Used by proxy.ts (middleware) to check JWT sessions
 * without loading Prisma or any Node.js-only packages.
 *
 * IMPORTANT: Must include jwt + session callbacks so that
 * `auth.user.role` is available inside the `authorized` callback.
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
        /**
         * Pass token.role → session.user.role so the `authorized`
         * callback can read it. No DB access here — purely token-based.
         */
        jwt({ token }) {
            // token.role is already set by auth.ts jwt callback when user logs in.
            // We just need to preserve it here.
            return token;
        },
        session({ session, token }) {
            // Map token.role → session.user.role so authorized() can read it
            if (session.user) {
                (session.user as any).role = token.role as string | undefined;
                if (token.sub) session.user.id = token.sub;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role as string | undefined;
            const pathname = nextUrl.pathname;

            // Auth pages — redirect already-logged-in users to their dashboard
            const isAuthPage = [
                "/login",
                "/admin/login",
                "/vendor/login",
                "/vendor/register",
            ].some(path => pathname.startsWith(path));

            if (isLoggedIn && isAuthPage) {
                if (userRole === "vendor") {
                    return Response.redirect(new URL("/vendor/dashboard", nextUrl));
                } else if (userRole === "admin") {
                    return Response.redirect(new URL("/admin/dashboard", nextUrl));
                } else {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
            }

            // Other public paths — always allow
            const isPublicPath = [
                "/about",
                "/help",
                "/contact",
                "/onboarding",
            ].some(path => pathname.startsWith(path))
                || pathname === "/"
                || isAuthPage;

            // API paths are always allowed
            const isApiPath = pathname.startsWith("/api");

            if (isPublicPath || isApiPath) {
                return true;
            }

            const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
            const isVendorPath = pathname === "/vendor" || pathname.startsWith("/vendor/");
            const isUserPath = [
                "/dashboard",
                "/profile",
                "/meal-planner",
                "/wallet",
                "/history",
                "/menus",
                "/vendors",
                "/profile-setup",
            ].some(path => pathname.startsWith(path));

            if (isLoggedIn) {
                if (userRole === "admin") {
                    // Admins: block from user-only paths
                    if (isUserPath) {
                        return Response.redirect(new URL("/admin/dashboard", nextUrl));
                    }
                } else if (userRole === "vendor") {
                    // Vendors: block from admin and user-only paths
                    if (isAdminPath || isUserPath) {
                        return Response.redirect(new URL("/vendor/dashboard", nextUrl));
                    }
                    // Vendors CAN access /vendor/* — allow through
                } else {
                    // Regular users: block from admin and vendor paths
                    if (isAdminPath || isVendorPath) {
                        return Response.redirect(new URL("/dashboard", nextUrl));
                    }
                }
            } else {
                // Not logged in: protect private paths
                if (isAdminPath) {
                    return Response.redirect(new URL("/admin/login", nextUrl));
                }
                if (isUserPath) {
                    return Response.redirect(new URL("/login", nextUrl));
                }
                if (isVendorPath) {
                    return Response.redirect(new URL("/vendor/login", nextUrl));
                }
            }

            return true;
        },
    },
};

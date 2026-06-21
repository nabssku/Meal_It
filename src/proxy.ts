import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Initialize NextAuth configuration for middleware
const { auth } = NextAuth(authConfig);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle CORS Preflight (OPTIONS) requests
  if (request.method === "OPTIONS" && pathname.startsWith("/api")) {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
    return response;
  }

  // 2. Run NextAuth authentication middleware for route checks
  const authResponse = await auth(request as any);

  // If NextAuth redirected the request, return that redirect response immediately
  if (authResponse instanceof Response && authResponse.headers.has("Location")) {
    return authResponse;
  }

  // 3. For all other requests, append CORS headers for API endpoints
  const response = authResponse instanceof Response ? authResponse : NextResponse.next();
  
  if (pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
  }

  return response;
}

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

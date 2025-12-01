import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Log OAuth callback requests
  if (request.nextUrl.pathname.startsWith("/api/auth/callback")) {
    console.log("[Middleware] OAuth callback detected:", {
      pathname: request.nextUrl.pathname,
      searchParams: Object.fromEntries(request.nextUrl.searchParams),
      method: request.method,
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/auth/:path*",
}


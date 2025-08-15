import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === "/login") {
    return NextResponse.next()
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
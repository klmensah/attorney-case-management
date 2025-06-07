import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this-in-production")

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth/login", "/api/auth/request-access"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    console.log("No auth token found, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    console.log("Invalid token, redirecting to login:", error)
    // Clear invalid token
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })
    return response
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"],
}

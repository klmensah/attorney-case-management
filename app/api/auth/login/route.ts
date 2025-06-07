import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called")

    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Query Supabase for user
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, name, role, password_hash, status")
      .eq("email", email)
      .eq("status", "approved")
      .limit(1)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.log("User not found or not approved")
      return NextResponse.json({ error: "Invalid credentials or account not approved" }, { status: 401 })
    }

    const user = users[0]
    console.log("User found:", user.email, "Role:", user.role, "Status:", user.status)

    // For admin user with email admin@lawfirm.com and password admin123
    if (user.email === "admin@lawfirm.com" && password === "admin123") {
      console.log("Demo admin login successful")
    } else if (user.password_hash) {
      const isValid = await verifyPassword(password, user.password_hash)
      console.log("Password valid:", isValid)

      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    } else {
      console.log("No password hash found for user")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = await generateToken(user.id, user.email)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("Login successful for:", email)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("id", authUser.userId)
      .limit(1)

    if (error || !users || users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

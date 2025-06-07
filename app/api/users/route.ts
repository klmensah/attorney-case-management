import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("status", "approved")
      .order("name")

    if (error) {
      throw error
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get reminder to check permissions
    const { data: reminderData, error: reminderError } = await supabase
      .from("reminders")
      .select("user_id, case_id")
      .eq("id", params.id)
      .single()

    if (reminderError || !reminderData) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    // Check permissions - only admin or reminder owner can update
    if (userData.role !== "admin" && reminderData.user_id !== user.userId) {
      return NextResponse.json({ error: "Access denied. You can only update your own reminders." }, { status: 403 })
    }

    const updates = await request.json()

    // Validate updates
    const allowedFields = ["is_completed", "title", "description", "reminder_date"]
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const { error } = await supabase.from("reminders").update(filteredUpdates).eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: "Reminder updated successfully" })
  } catch (error) {
    console.error("Update reminder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get reminder to check permissions
    const { data: reminderData, error: reminderError } = await supabase
      .from("reminders")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (reminderError || !reminderData) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    // Check permissions - only admin or reminder owner can delete
    if (userData.role !== "admin" && reminderData.user_id !== user.userId) {
      return NextResponse.json({ error: "Access denied. You can only delete your own reminders." }, { status: 403 })
    }

    const { error } = await supabase.from("reminders").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: "Reminder deleted successfully" })
  } catch (error) {
    console.error("Delete reminder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

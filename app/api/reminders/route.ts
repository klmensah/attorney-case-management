import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { case_id, title, description, reminder_date } = await request.json()

    // Check if user has permission to add reminders to this case
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get case to check permissions
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("assigned_to")
      .eq("id", case_id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check permissions - only admin or assigned user can add reminders
    if (userData.role !== "admin" && caseData.assigned_to !== user.userId) {
      return NextResponse.json(
        { error: "Access denied. You can only add reminders to cases assigned to you." },
        { status: 403 },
      )
    }

    const { error } = await supabase.from("reminders").insert([
      {
        case_id: Number.parseInt(case_id),
        user_id: user.userId,
        title,
        description,
        reminder_date,
      },
    ])

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Create reminder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

    let query = supabase
      .from("reminders")
      .select(`
        *,
        case_subject:cases(subject),
        suit_number:cases(suit_number)
      `)
      .eq("is_completed", false)
      .order("reminder_date", { ascending: true })

    // Apply user-specific filtering
    if (userData.role !== "admin") {
      // Non-admin users can only see their own reminders
      query = query.eq("user_id", user.userId)
    }

    const { data: reminders, error } = await query

    if (error) {
      throw error
    }

    // Transform data
    const transformedReminders =
      reminders?.map((reminder) => ({
        ...reminder,
        case_subject: reminder.case_subject?.subject || "Unknown Case",
        suit_number: reminder.suit_number?.suit_number || "Unknown",
      })) || []

    return NextResponse.json({ reminders: transformedReminders })
  } catch (error) {
    console.error("Get reminders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

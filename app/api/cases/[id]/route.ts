import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get case details
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select(`
        *,
        assigned_to_name:users(name)
      `)
      .eq("id", params.id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check if user has permission to view this case
    if (userData.role !== "admin" && caseData.assigned_to !== user.userId) {
      return NextResponse.json({ error: "Access denied. You can only view cases assigned to you." }, { status: 403 })
    }

    // Get movement logs
    const { data: movements } = await supabase
      .from("movement_logs")
      .select(`
        *,
        moved_by_name:users(name)
      `)
      .eq("case_id", params.id)
      .order("movement_date", { ascending: false })

    // Get comments
    const { data: comments } = await supabase
      .from("case_comments")
      .select(`
        *,
        user_name:users(name)
      `)
      .eq("case_id", params.id)
      .order("created_at", { ascending: false })

    // Get reminders
    const { data: reminders } = await supabase
      .from("reminders")
      .select("*")
      .eq("case_id", params.id)
      .order("reminder_date", { ascending: true })

    // Transform data
    const transformedCase = {
      ...caseData,
      assigned_to_name: caseData.assigned_to_name?.name || null,
    }

    const transformedMovements =
      movements?.map((movement) => ({
        ...movement,
        moved_by_name: movement.moved_by_name?.name || "Unknown",
      })) || []

    const transformedComments =
      comments?.map((comment) => ({
        ...comment,
        user_name: comment.user_name?.name || "Unknown",
      })) || []

    return NextResponse.json({
      case: transformedCase,
      movements: transformedMovements,
      comments: transformedComments,
      reminders: reminders || [],
      userRole: userData.role,
    })
  } catch (error) {
    console.error("Get case error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get case to check permissions
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("assigned_to")
      .eq("id", params.id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check permissions - only admin or assigned user can update
    if (userData.role !== "admin" && caseData.assigned_to !== user.userId) {
      return NextResponse.json({ error: "Access denied. You can only update cases assigned to you." }, { status: 403 })
    }

    const updates = await request.json()

    // Non-admin users cannot change assignment
    if (userData.role !== "admin" && updates.assigned_to !== undefined) {
      return NextResponse.json({ error: "Only administrators can change case assignments." }, { status: 403 })
    }

    const { error } = await supabase.from("cases").update(updates).eq("id", params.id)

    if (error) {
      throw error
    }

    // Add movement log for update
    await supabase.from("movement_logs").insert([
      {
        case_id: Number.parseInt(params.id),
        action_taken: `Case ${updates.status ? `status updated to ${updates.status}` : "updated"}`,
        moved_by: user.userId,
        notes: "Case information updated",
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update case error:", error)
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

    // Only admins can delete cases
    if (userData.role !== "admin") {
      return NextResponse.json({ error: "Only administrators can delete cases." }, { status: 403 })
    }

    // Delete the case (this will cascade delete related records due to foreign key constraints)
    const { error } = await supabase.from("cases").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: "Case deleted successfully" })
  } catch (error) {
    console.error("Delete case error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

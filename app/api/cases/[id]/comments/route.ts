import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check permissions - only admin or assigned user can add comments
    if (userData.role !== "admin" && caseData.assigned_to !== user.userId) {
      return NextResponse.json(
        { error: "Access denied. You can only add comments to cases assigned to you." },
        { status: 403 },
      )
    }

    const { comment } = await request.json()

    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 })
    }

    const { error } = await supabase.from("case_comments").insert([
      {
        case_id: Number.parseInt(params.id),
        user_id: user.userId,
        comment: comment.trim(),
      },
    ])

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: "Comment added successfully" })
  } catch (error) {
    console.error("Add comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

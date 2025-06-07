import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"
import { sendReminderEmail } from "@/lib/resend"

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.userId).single()

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all access requests
    const { data: requests, error } = await supabase
      .from("access_requests")
      .select(`
        *,
        processed_by_name:users(name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ requests: requests || [] })
  } catch (error) {
    console.error("Get access requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.userId).single()

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { requestId, action, password } = await request.json()

    if (!requestId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Get the access request
    const { data: accessRequest, error: fetchError } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    if (fetchError || !accessRequest) {
      return NextResponse.json({ error: "Access request not found" }, { status: 404 })
    }

    if (accessRequest.status !== "pending") {
      return NextResponse.json({ error: "Request has already been processed" }, { status: 400 })
    }

    if (action === "approve") {
      if (!password) {
        return NextResponse.json({ error: "Password is required for approval" }, { status: 400 })
      }

      // Create user account
      const hashedPassword = await hashPassword(password)

      const { error: userError } = await supabase.from("users").insert([
        {
          email: accessRequest.email,
          name: accessRequest.name,
          role: "attorney",
          status: "approved",
          password_hash: hashedPassword,
        },
      ])

      if (userError) {
        console.error("Error creating user:", userError)
        return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
      }

      // Send approval email
      try {
        await sendReminderEmail(accessRequest.email, accessRequest.name, {
          title: "Account Approved",
          description: `Your access request has been approved. You can now log in with your email and the password provided by the administrator.`,
          case_subject: "Account Access",
          suit_number: "SYSTEM",
        })
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError)
        // Don't fail the request if email fails
      }
    }

    // Update access request status
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        processed_at: new Date().toISOString(),
        processed_by: user.userId,
      })
      .eq("id", requestId)

    if (updateError) {
      throw updateError
    }

    // Send rejection email if rejected
    if (action === "reject") {
      try {
        await sendReminderEmail(accessRequest.email, accessRequest.name, {
          title: "Account Request Rejected",
          description:
            "Your access request has been reviewed and unfortunately cannot be approved at this time. Please contact the administrator for more information.",
          case_subject: "Account Access",
          suit_number: "SYSTEM",
        })
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully${action === "approve" ? " and user account created" : ""}`,
    })
  } catch (error) {
    console.error("Process access request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

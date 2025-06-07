import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, name, message } = await request.json()

    // Basic validation
    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Check if email already exists in users or access_requests
    const { data: existingUser } = await supabase.from("users").select("email").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
    }

    const { data: existingRequest } = await supabase
      .from("access_requests")
      .select("email, status")
      .eq("email", email)
      .single()

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return NextResponse.json({ error: "A request with this email is already pending" }, { status: 400 })
      }
      if (existingRequest.status === "approved") {
        return NextResponse.json(
          { error: "This email has already been approved. Please contact admin." },
          { status: 400 },
        )
      }
    }

    // Insert the access request
    const { error } = await supabase.from("access_requests").insert([
      {
        email,
        name,
        message: message || null,
        status: "pending",
      },
    ])

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Access request submitted successfully. You will be notified when your request is reviewed.",
    })
  } catch (error) {
    console.error("Access request error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

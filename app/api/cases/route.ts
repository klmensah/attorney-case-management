import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const offset = (page - 1) * limit

    let query = supabase.from("cases").select(`
        *,
        assigned_to_name:users(name)
      `)

    // Apply user-specific filtering
    if (userData.role !== "admin") {
      // Non-admin users can only see cases they created (assigned to themselves)
      query = query.eq("assigned_to", user.userId)
    }

    // Apply search filters
    if (search) {
      query = query.or(`suit_number.ilike.%${search}%,subject.ilike.%${search}%,file_number.ilike.%${search}%`)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Get total count for pagination
    let countQuery = supabase.from("cases").select("*", { count: "exact", head: true })

    if (userData.role !== "admin") {
      countQuery = countQuery.eq("assigned_to", user.userId)
    }

    if (search) {
      countQuery = countQuery.or(
        `suit_number.ilike.%${search}%,subject.ilike.%${search}%,file_number.ilike.%${search}%`,
      )
    }

    if (status && status !== "all") {
      countQuery = countQuery.eq("status", status)
    }

    const { count } = await countQuery

    // Get paginated results
    const { data: cases, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Transform the data to match expected format
    const transformedCases =
      cases?.map((case_) => ({
        ...case_,
        assigned_to_name: case_.assigned_to_name?.name || null,
      })) || []

    return NextResponse.json({
      cases: transformedCases,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      userRole: userData.role,
    })
  } catch (error) {
    console.error("Get cases error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date_assigned, suit_number, file_number, subject, assigning_officer, priority } = await request.json()

    // For attorneys, automatically assign the case to themselves
    const { data: newCase, error } = await supabase
      .from("cases")
      .insert([
        {
          date_assigned,
          suit_number,
          file_number,
          subject,
          assigning_officer,
          assigned_to: user.userId, // Always assign to the creating user
          priority,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Add initial movement log
    await supabase.from("movement_logs").insert([
      {
        case_id: newCase.id,
        action_taken: "Case created and registered",
        moved_by: user.userId,
        notes: "Initial case creation by attorney",
      },
    ])

    return NextResponse.json({ success: true, caseId: newCase.id })
  } catch (error) {
    console.error("Create case error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get case to check permissions
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("assigned_to")
      .eq("id", params.id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check permissions - only admin or assigned user can view documents
    if (userData.role !== "admin" && caseData.assigned_to !== user.userId) {
      return NextResponse.json(
        { error: "Access denied. You can only view documents for cases assigned to you." },
        { status: 403 },
      )
    }

    // Get documents for this case
    const { data: documents, error } = await supabase
      .from("documents")
      .select(`
        *,
        uploaded_by:users(name)
      `)
      .eq("case_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Transform data and generate signed URLs for documents
    const transformedDocuments = await Promise.all(
      (documents || []).map(async (doc) => {
        let signedUrl = null

        // Generate signed URL for Supabase Storage
        if (doc.file_path && doc.file_path.startsWith("documents/")) {
          const { data: urlData } = await supabase.storage.from("case-documents").createSignedUrl(doc.file_path, 3600) // 1 hour expiry

          signedUrl = urlData?.signedUrl
        }

        return {
          ...doc,
          uploaded_by_name: doc.uploaded_by?.name || "Unknown",
          signed_url: signedUrl,
        }
      }),
    )

    return NextResponse.json({ documents: transformedDocuments })
  } catch (error) {
    console.error("Get documents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Check permissions - only admin or assigned user can upload documents
    if (userData.role !== "admin" && caseData.assigned_to !== user.userId) {
      return NextResponse.json(
        { error: "Access denied. You can only upload documents to cases assigned to you." },
        { status: 403 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (limit to 10MB for free plan)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `documents/case-${params.id}/${timestamp}_${sanitizedName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("case-documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Store document metadata in database
    const { error: dbError } = await supabase.from("documents").insert([
      {
        case_id: Number.parseInt(params.id),
        user_id: user.userId,
        filename: sanitizedName,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_path: fileName, // Store the Supabase Storage path
      },
    ])

    if (dbError) {
      // If database insert fails, clean up the uploaded file
      await supabase.storage.from("case-documents").remove([fileName])
      throw dbError
    }

    return NextResponse.json({ success: true, message: "Document uploaded successfully" })
  } catch (error) {
    console.error("Upload document error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get document details
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select(`
        *,
        case:cases(assigned_to)
      `)
      .eq("id", params.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
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

    // Check permissions - only admin or assigned user can view documents
    if (userData.role !== "admin" && document.case?.assigned_to !== user.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("case-documents")
      .download(document.file_path)

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Convert blob to buffer
    const buffer = await fileData.arrayBuffer()

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": document.mime_type,
        "Content-Disposition": `inline; filename="${document.original_filename}"`,
        "Content-Length": document.file_size.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Get document error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

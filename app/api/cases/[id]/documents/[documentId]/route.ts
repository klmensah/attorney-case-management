import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string; documentId: string } }) {
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

    // Get document to check permissions and get file path
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("file_path, case_id, uploaded_by")
      .eq("id", params.documentId)
      .single()

    if (documentError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Get case to check permissions
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("assigned_to")
      .eq("id", document.case_id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check permissions - only admin, document uploader, or case owner can delete
    const canDelete =
      userData.role === "admin" || document.uploaded_by === user.userId || caseData.assigned_to === user.userId

    if (!canDelete) {
      return NextResponse.json(
        { error: "Access denied. You don't have permission to delete this document." },
        { status: 403 },
      )
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage.from("case-documents").remove([document.file_path])

    if (storageError) {
      console.error("Storage delete error:", storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete document record from database
    const { error } = await supabase.from("documents").delete().eq("id", params.documentId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: "Document deleted successfully" })
  } catch (error) {
    console.error("Delete document error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

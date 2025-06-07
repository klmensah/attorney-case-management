"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Download, Printer, X, FileText, ImageIcon, File } from "lucide-react"

interface DocumentViewerProps {
  document: {
    id: number
    original_filename: string
    mime_type: string
    file_size: number
    signed_url?: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export default function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  if (!document) return null

  const isPDF = document.mime_type === "application/pdf"
  const isImage = document.mime_type.startsWith("image/")
  const isText = document.mime_type.startsWith("text/")

  const handlePrint = async () => {
    try {
      setLoading(true)

      // Use signed URL if available, otherwise fallback to API
      const documentUrl = document.signed_url || `/api/documents/${document.id}`

      // Open in new window for printing
      const printWindow = window.open(documentUrl, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      } else {
        toast({ title: "Error", description: "Could not open print window", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to print document", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      setLoading(true)

      // Use signed URL if available, otherwise fallback to API
      const documentUrl = document.signed_url || `/api/documents/${document.id}`

      const response = await fetch(documentUrl)

      if (!response.ok) {
        throw new Error("Failed to download document")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Create download link
      const a = document.createElement("a")
      a.href = url
      a.download = document.original_filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({ title: "Success", description: "Document downloaded successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to download document", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = () => {
    if (isPDF) return <FileText className="w-6 h-6 text-red-500" />
    if (isImage) return <ImageIcon className="w-6 h-6 text-blue-500" />
    return <File className="w-6 h-6 text-gray-500" />
  }

  const documentUrl = document.signed_url || `/api/documents/${document.id}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <DialogTitle className="truncate">{document.original_filename}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={loading}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isPDF && (
            <iframe src={documentUrl} className="w-full h-[70vh] border rounded" title={document.original_filename} />
          )}

          {isImage && (
            <div className="flex justify-center p-4">
              <img
                src={documentUrl || "/placeholder.svg"}
                alt={document.original_filename}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          )}

          {isText && (
            <iframe src={documentUrl} className="w-full h-[70vh] border rounded" title={document.original_filename} />
          )}

          {!isPDF && !isImage && !isText && (
            <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
              <File className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-medium mb-2">Preview not available</h3>
              <p className="text-sm text-center mb-4">
                This file type cannot be previewed in the browser.
                <br />
                Use the download button to save the file to your computer.
              </p>
              <div className="text-sm">
                <p>
                  <strong>File:</strong> {document.original_filename}
                </p>
                <p>
                  <strong>Type:</strong> {document.mime_type}
                </p>
                <p>
                  <strong>Size:</strong> {(document.file_size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

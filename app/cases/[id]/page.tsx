"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  MapPin,
  Calendar,
  Bell,
  Edit,
  Trash2,
  Settings,
  UserPlus,
  FileText,
  Eye,
  Download,
  Printer,
  ImageIcon,
  File,
} from "lucide-react"
import Link from "next/link"
import DocumentViewer from "@/components/document-viewer"

interface CaseData {
  id: number
  suit_number: string
  file_number: string
  subject: string
  assigning_officer: string
  assigned_to: number | null
  assigned_to_name: string
  status: string
  priority: string
  date_assigned: string
  created_at: string
}

interface Movement {
  id: number
  movement_date: string
  location: string
  action_taken: string
  moved_by_name: string
  notes: string
}

interface Comment {
  id: number
  comment: string
  user_name: string
  created_at: string
}

interface Reminder {
  id: number
  title: string
  description: string
  reminder_date: string
  is_completed: boolean
}

interface User {
  id: number
  name: string
  email: string
}

interface Document {
  id: number
  original_filename: string
  mime_type: string
  file_size: number
  uploaded_by_name: string
  created_at: string
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string

  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedAttorney, setSelectedAttorney] = useState<string>("0")
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)

  // Form states
  const [newMovement, setNewMovement] = useState({
    location: "",
    action_taken: "",
    notes: "",
  })
  const [newComment, setNewComment] = useState("")
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    reminder_date: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchCaseData()
    fetchUsers()
    fetchDocuments()
  }, [caseId])

  const fetchCaseData = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`)
      if (response.ok) {
        const data = await response.json()
        setCaseData(data.case)
        setMovements(data.movements)
        setComments(data.comments)
        setReminders(data.reminders)

        // Set the selected attorney if one is assigned
        if (data.case.assigned_to) {
          setSelectedAttorney(data.case.assigned_to.toString())
        }
      } else {
        toast({ title: "Error fetching case data", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error fetching case data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        console.error("Error fetching documents:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }

  const updateCaseStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({ title: "Case status updated successfully" })
        fetchCaseData()
      } else {
        toast({ title: "Error updating case status", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error updating case status", variant: "destructive" })
    }
  }

  const assignCase = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: selectedAttorney ? Number.parseInt(selectedAttorney) : null,
        }),
      })

      if (response.ok) {
        toast({ title: "Case assigned successfully" })
        setAssignDialogOpen(false)
        fetchCaseData()
      } else {
        toast({ title: "Error assigning case", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error assigning case", variant: "destructive" })
    }
  }

  const deleteCase = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Case deleted successfully" })
        router.push("/dashboard")
      } else {
        toast({ title: "Error deleting case", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error deleting case", variant: "destructive" })
    }
  }

  const addMovement = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovement),
      })

      if (response.ok) {
        toast({ title: "Movement added successfully" })
        setNewMovement({ location: "", action_taken: "", notes: "" })
        fetchCaseData()
      } else {
        toast({ title: "Error adding movement", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error adding movement", variant: "destructive" })
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/cases/${caseId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment }),
      })

      if (response.ok) {
        toast({ title: "Comment added successfully" })
        setNewComment("")
        fetchCaseData()
      } else {
        toast({ title: "Error adding comment", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error adding comment", variant: "destructive" })
    }
  }

  const addReminder = async () => {
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          ...newReminder,
        }),
      })

      if (response.ok) {
        toast({ title: "Reminder created successfully" })
        setNewReminder({ title: "", description: "", reminder_date: "" })
        fetchCaseData()
      } else {
        toast({ title: "Error creating reminder", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error creating reminder", variant: "destructive" })
    }
  }

  const toggleReminderStatus = async (reminderId: number, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !isCompleted }),
      })

      if (response.ok) {
        toast({ title: "Reminder status updated" })
        fetchCaseData()
      } else {
        toast({ title: "Error updating reminder", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error updating reminder", variant: "destructive" })
    }
  }

  const deleteReminder = async (reminderId: number) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Reminder deleted successfully" })
        fetchCaseData()
      } else {
        toast({ title: "Error deleting reminder", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error deleting reminder", variant: "destructive" })
    }
  }

  const uploadDocument = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/cases/${caseId}/documents`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({ title: "Document uploaded successfully" })
        fetchDocuments()
      } else {
        const error = await response.json()
        toast({ title: "Error uploading document", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error uploading document", variant: "destructive" })
    }
  }

  const openDocument = (document: Document) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
  }

  const downloadDocument = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}`)

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
    }
  }

  const printDocument = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}`)

      if (!response.ok) {
        throw new Error("Failed to load document")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Open in new window for printing
      const printWindow = window.open(url, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      } else {
        toast({ title: "Error", description: "Could not open print window", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to print document", variant: "destructive" })
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading case details...</p>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Not Found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{caseData.suit_number}</h1>
          <p className="text-gray-600 mt-2">File: {caseData.file_number}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getPriorityColor(caseData.priority)}>{caseData.priority}</Badge>
          <Badge className={getStatusColor(caseData.status)}>{caseData.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Case</DialogTitle>
                <DialogDescription>Update case status or delete the case</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Change Status</Label>
                  <Select value={caseData.status} onValueChange={updateCaseStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Case
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the case and all associated data
                          including movements, comments, and reminders.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteCase} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Case Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Case Overview</CardTitle>
          <CardDescription>Basic case information and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Subject</h3>
              <p className="text-gray-700">{caseData.subject}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Assigning Officer</h3>
              <p className="text-gray-700">{caseData.assigning_officer}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Assigned To</h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-700">{caseData.assigned_to_name || "Unassigned"}</p>
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="w-4 h-4 mr-1" />
                      {caseData.assigned_to ? "Reassign" : "Assign"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Case</DialogTitle>
                      <DialogDescription>Select an attorney to assign this case to</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="attorney">Attorney</Label>
                        <Select value={selectedAttorney} onValueChange={setSelectedAttorney}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an attorney" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Unassigned</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={assignCase}>Assign Case</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Date Assigned</h3>
              <p className="text-gray-700">{new Date(caseData.date_assigned).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="movements">Movement Log</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Movement Log</CardTitle>
                  <CardDescription>Track the movement and actions for this case</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Movement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Movement Entry</DialogTitle>
                      <DialogDescription>Record a new movement or action for this case</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newMovement.location}
                          onChange={(e) => setNewMovement({ ...newMovement, location: e.target.value })}
                          placeholder="e.g., Court Registry, Judge Chambers"
                        />
                      </div>
                      <div>
                        <Label htmlFor="action">Action Taken</Label>
                        <Textarea
                          id="action"
                          value={newMovement.action_taken}
                          onChange={(e) => setNewMovement({ ...newMovement, action_taken: e.target.value })}
                          placeholder="Describe the action taken"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newMovement.notes}
                          onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                          placeholder="Additional notes or details"
                        />
                      </div>
                      <Button onClick={addMovement} className="w-full">
                        Add Movement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.map((movement) => (
                  <div key={movement.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{movement.location}</span>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(movement.movement_date).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-800 mb-2">{movement.action_taken}</p>
                    {movement.notes && <p className="text-sm text-gray-600 mb-2">{movement.notes}</p>}
                    <p className="text-xs text-gray-500">Recorded by: {movement.moved_by_name}</p>
                  </div>
                ))}

                {movements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No movement records found for this case</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments & Remarks</CardTitle>
              <CardDescription>Case discussions and remarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{comment.user_name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-800">{comment.comment}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No comments found for this case</div>
                )}
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="new-comment">Add Comment</Label>
                <div className="flex gap-2 mt-2">
                  <Textarea
                    id="new-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your comment or remarks..."
                    className="flex-1"
                  />
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Reminders</CardTitle>
                  <CardDescription>Set and manage case reminders</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reminder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Reminder</DialogTitle>
                      <DialogDescription>Set a reminder for this case</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reminder-title">Title</Label>
                        <Input
                          id="reminder-title"
                          value={newReminder.title}
                          onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                          placeholder="Reminder title"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="reminder-description">Description</Label>
                        <Textarea
                          id="reminder-description"
                          value={newReminder.description}
                          onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                          placeholder="Reminder description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reminder-date">Reminder Date & Time</Label>
                        <Input
                          id="reminder-date"
                          type="datetime-local"
                          value={newReminder.reminder_date}
                          onChange={(e) => setNewReminder({ ...newReminder, reminder_date: e.target.value })}
                          required
                        />
                      </div>
                      <Button onClick={addReminder} className="w-full">
                        Create Reminder
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{reminder.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {new Date(reminder.reminder_date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {reminder.description && <p className="text-gray-700 mb-2">{reminder.description}</p>}
                    <div className="flex justify-between items-center">
                      <Badge variant={reminder.is_completed ? "default" : "secondary"}>
                        {reminder.is_completed ? "Completed" : "Pending"}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleReminderStatus(reminder.id, reminder.is_completed)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          {reminder.is_completed ? "Mark Pending" : "Mark Complete"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this reminder? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReminder(reminder.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}

                {reminders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No reminders set for this case</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Case documents and files - Click to view, download, or print</CardDescription>
                </div>
                <div>
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        uploadDocument(file)
                        e.target.value = "" // Reset input
                      }
                    }}
                  />
                  <Button onClick={() => document.getElementById("document-upload")?.click()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(doc.mime_type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{doc.original_filename}</h4>
                          <p className="text-sm text-gray-600">
                            {(doc.file_size / 1024).toFixed(1)} KB • {doc.mime_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDocument(doc)} title="View Document">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(doc)}
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => printDocument(doc)} title="Print Document">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Uploaded by: {doc.uploaded_by_name}</span>
                      <span>{new Date(doc.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
                    <p className="text-sm mb-4">Upload documents related to this case to get started.</p>
                    <Button onClick={() => document.getElementById("document-upload")?.click()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload First Document
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Viewer */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={documentViewerOpen}
        onClose={() => {
          setDocumentViewerOpen(false)
          setSelectedDocument(null)
        }}
      />
    </div>
  )
}

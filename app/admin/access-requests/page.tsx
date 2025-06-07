"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { ArrowLeft, UserCheck, UserX, Clock, CheckCircle, XCircle, Mail, Calendar } from "lucide-react"
import Link from "next/link"

interface AccessRequest {
  id: number
  email: string
  name: string
  message: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  processed_at: string | null
  processed_by_name: { name: string } | null
}

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [approvalPassword, setApprovalPassword] = useState("")
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/access-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      } else if (response.status === 403) {
        toast({ title: "Access denied", description: "Admin privileges required", variant: "destructive" })
      } else if (response.status === 401) {
        toast({ title: "Unauthorized", description: "Please log in again", variant: "destructive" })
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({ title: "Error fetching requests", description: errorData.error, variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast({ title: "Network error", description: "Please check your connection", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const processRequest = async (requestId: number, action: "approve" | "reject", password?: string) => {
    setProcessingId(requestId)
    try {
      const response = await fetch("/api/admin/access-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          password: action === "approve" ? password : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: data.message })
        fetchRequests()
        setApprovalDialogOpen(false)
        setApprovalPassword("")
        setSelectedRequestId(null)
      } else {
        const error = await response.json()
        toast({ title: "Error processing request", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error processing request", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleApprove = (requestId: number) => {
    setSelectedRequestId(requestId)
    setApprovalDialogOpen(true)
  }

  const confirmApproval = () => {
    if (selectedRequestId && approvalPassword.trim()) {
      processRequest(selectedRequestId, "approve", approvalPassword)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const processedRequests = requests.filter((r) => r.status !== "pending")

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading access requests...</p>
          </div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Access Requests</h1>
          <p className="text-gray-600 mt-2">Manage user access requests to the system</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter((r) => r.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {requests.filter((r) => r.status === "rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>Requests awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <h3 className="text-lg font-semibold">{request.name}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">Email: {request.email}</p>
                      {request.message && (
                        <p className="text-gray-700 mb-2">
                          <strong>Message:</strong> {request.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Requested: {new Date(request.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        size="sm"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={processingId === request.id} size="sm">
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject Access Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject the access request from {request.name}? They will be
                              notified via email.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => processRequest(request.id, "reject")}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reject Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>Complete history of access requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <h3 className="text-lg font-semibold">{request.name}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">Email: {request.email}</p>
                    {request.message && (
                      <p className="text-gray-700 mb-2">
                        <strong>Message:</strong> {request.message}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Requested: {new Date(request.created_at).toLocaleString()}</span>
                      </div>
                      {request.processed_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Processed: {new Date(request.processed_at).toLocaleString()}</span>
                        </div>
                      )}
                      {request.processed_by_name && <span>by {request.processed_by_name.name}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {requests.length === 0 && <div className="text-center py-8 text-gray-500">No access requests found</div>}
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Access Request</DialogTitle>
            <DialogDescription>
              Set a temporary password for the new user. They should change this after their first login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                value={approvalPassword}
                onChange={(e) => setApprovalPassword(e.target.value)}
                placeholder="Enter a temporary password"
              />
              <p className="text-sm text-gray-500">The user will receive an email notification about their approval.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmApproval} disabled={!approvalPassword.trim() || processingId !== null}>
                {processingId ? "Processing..." : "Approve & Create Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

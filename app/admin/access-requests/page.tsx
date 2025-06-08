"use client"

import { useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import {
  ArrowLeftIcon,
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline"
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

// Simple Button Component
const Button = ({ children, onClick, disabled, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Simple Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
)

const CardContent = ({ children, className = "" }) => <div className={`px-6 py-4 ${className}`}>{children}</div>

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
)

// Simple Badge Component
const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
)

// Simple Input Component
const Input = ({ className = "", ...props }) => (
  <input
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    {...props}
  />
)

// Simple Label Component
const Label = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
)

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [approvalPassword, setApprovalPassword] = useState("")
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null)

  // Simple toast function
  const toast = ({ title, description, variant = "default" }) => {
    // You can implement a simple toast or just use alert for now
    alert(`${title}${description ? ": " + description : ""}`)
  }

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
        setAlertDialogOpen(false)
        setSelectedRejectId(null)
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

  const handleReject = (requestId: number) => {
    setSelectedRejectId(requestId)
    setAlertDialogOpen(true)
  }

  const confirmApproval = () => {
    if (selectedRequestId && approvalPassword.trim()) {
      processRequest(selectedRequestId, "approve", approvalPassword)
    }
  }

  const confirmReject = () => {
    if (selectedRejectId) {
      processRequest(selectedRejectId, "reject")
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
        return <ClockIcon className="w-4 h-4" />
      case "approved":
        return <CheckCircleIcon className="w-4 h-4" />
      case "rejected":
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

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
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
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
            <ClockIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-gray-400" />
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
            <XCircleIcon className="h-4 w-4 text-gray-400" />
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
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
            <p className="text-sm text-gray-600">Requests awaiting your review</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-500" />
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
                        <CalendarIcon className="w-4 h-4" />
                        <span>Requested: {new Date(request.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        size="sm"
                      >
                        <UserPlusIcon className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        size="sm"
                      >
                        <UserMinusIcon className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Requests */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <p className="text-sm text-gray-600">Complete history of access requests</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-500" />
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
                        <CalendarIcon className="w-4 h-4" />
                        <span>Requested: {new Date(request.created_at).toLocaleString()}</span>
                      </div>
                      {request.processed_at && (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
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
      <Transition appear show={approvalDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setApprovalDialogOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Approve Access Request
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Set a temporary password for the new user. They should change this after their first login.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="password">Temporary Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={approvalPassword}
                        onChange={(e) => setApprovalPassword(e.target.value)}
                        placeholder="Enter a temporary password"
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        The user will receive an email notification about their approval.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={confirmApproval} disabled={!approvalPassword.trim() || processingId !== null}>
                      {processingId ? "Processing..." : "Approve & Create Account"}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Reject Confirmation Dialog */}
      <Transition appear show={alertDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setAlertDialogOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Reject Access Request
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to reject this access request? The user will be notified via email.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmReject}>
                      Reject Request
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

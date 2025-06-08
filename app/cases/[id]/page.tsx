"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, DocumentTextIcon, CalendarIcon, UserIcon } from "@heroicons/react/24/outline"

// Simple components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children }) => <div className="px-6 py-4 border-b border-gray-200">{children}</div>

const CardContent = ({ children }) => <div className="px-6 py-4">{children}</div>

const CardTitle = ({ children }) => <h3 className="text-lg font-semibold text-gray-900">{children}</h3>

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

const Input = ({ className = "", ...props }) => (
  <input
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    {...props}
  />
)

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
    {children}
  </label>
)

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    {...props}
  />
)

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    client_name: "",
    client_email: "",
  })

  useEffect(() => {
    if (params.id) {
      fetchCaseData()
    }
  }, [params.id])

  const fetchCaseData = async () => {
    try {
      // Mock data for now
      const mockCase = {
        id: params.id,
        title: "Sample Case",
        description: "This is a sample case description",
        status: "active",
        client_name: "John Doe",
        client_email: "john@example.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setCaseData(mockCase)
      setFormData({
        title: mockCase.title,
        description: mockCase.description,
        status: mockCase.status,
        client_name: mockCase.client_name,
        client_email: mockCase.client_email,
      })
    } catch (error) {
      console.error("Error fetching case:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Implement save logic here
      console.log("Saving case:", formData)
      setEditing(false)
      // Update caseData with formData
      setCaseData({ ...caseData, ...formData })
    } catch (error) {
      console.error("Error saving case:", error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading case details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Not Found</h1>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Case Details</h1>
            <p className="text-gray-600">Case ID: {caseData.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={() => setEditing(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Edit Case</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              Case Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Case Title</Label>
              {editing ? (
                <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} />
              ) : (
                <p className="text-gray-900 font-medium">{caseData.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              {editing ? (
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{caseData.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              {editing ? (
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              ) : (
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    caseData.status === "active"
                      ? "bg-green-100 text-green-800"
                      : caseData.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {caseData.status}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client_name">Client Name</Label>
              {editing ? (
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange("client_name", e.target.value)}
                />
              ) : (
                <p className="text-gray-900 font-medium">{caseData.client_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="client_email">Client Email</Label>
              {editing ? (
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange("client_email", e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{caseData.client_email}</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Created: {new Date(caseData.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4" />
                <span>Updated: {new Date(caseData.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

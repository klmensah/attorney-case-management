"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function NewCasePage() {
  const [formData, setFormData] = useState({
    date_assigned: "",
    suit_number: "",
    file_number: "",
    subject: "",
    assigning_officer: "",
    priority: "medium",
  })
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: "Case created successfully" })
        router.push(`/cases/${data.caseId}`)
      } else {
        const error = await response.json()
        toast({ title: "Error creating case", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error creating case", description: "Network error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Case</h1>
          <p className="text-gray-600 mt-2">Register a new case file to your portfolio</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
          <CardDescription>Fill in the details for the new case file you received</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_assigned">Date Received</Label>
                <Input
                  id="date_assigned"
                  type="date"
                  value={formData.date_assigned}
                  onChange={(e) => handleChange("date_assigned", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suit_number">Suit Number</Label>
                <Input
                  id="suit_number"
                  value={formData.suit_number}
                  onChange={(e) => handleChange("suit_number", e.target.value)}
                  placeholder="e.g., SUIT-2024-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="file_number">File Number</Label>
                <Input
                  id="file_number"
                  value={formData.file_number}
                  onChange={(e) => handleChange("file_number", e.target.value)}
                  placeholder="e.g., FILE-001"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Case Subject/Description</Label>
              <Textarea
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Brief description of the case"
                required
              />
            </div>

            <div>
              <Label htmlFor="assigning_officer">Assigning Officer/Court</Label>
              <Input
                id="assigning_officer"
                value={formData.assigning_officer}
                onChange={(e) => handleChange("assigning_officer", e.target.value)}
                placeholder="Name of the court or assigning authority"
                required
              />
            </div>

            {/* Show assigned attorney (read-only) */}
            <div>
              <Label htmlFor="assigned_to">Assigned Attorney</Label>
              <Input id="assigned_to" value={currentUser?.name || "Loading..."} disabled className="bg-gray-100" />
              <p className="text-sm text-gray-500 mt-1">This case will be assigned to you automatically</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating Case..." : "Add Case"}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

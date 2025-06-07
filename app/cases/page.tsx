"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Calendar, FileText, User } from "lucide-react"
import Link from "next/link"

interface Case {
  id: number
  suit_number: string
  file_number: string
  subject: string
  assigning_officer: string
  assigned_to_name: string
  status: string
  priority: string
  date_assigned: string
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchCases()
  }, [search, statusFilter, currentPage])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        page: currentPage.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/cases?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching cases:", error)
    } finally {
      setLoading(false)
    }
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

  if (loading && cases.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cases...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Cases</h1>
          <p className="text-gray-600 mt-2">Manage and track all legal cases</p>
        </div>
        <Link href="/cases/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Cases</CardTitle>
          <CardDescription>Search and filter cases by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by suit number, file number, or subject..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="space-y-4">
        {cases.map((case_) => (
          <Link key={case_.id} href={`/cases/${case_.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <h3 className="text-xl font-semibold text-gray-900">{case_.suit_number}</h3>
                      <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                      <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                    </div>
                    <p className="text-gray-600 mb-2">File: {case_.file_number}</p>
                    <p className="text-gray-800 mb-3">{case_.subject}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Assigned by: {case_.assigning_officer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Assigned to: {case_.assigned_to_name || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date: {new Date(case_.date_assigned).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {cases.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
              <p className="text-gray-600 mb-4">
                {search || statusFilter !== "all"
                  ? "No cases match your current filters."
                  : "Get started by creating your first case."}
              </p>
              <Link href="/cases/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Case
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total cases)
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
            disabled={currentPage === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Calendar, FileText, Users, AlertTriangle } from "lucide-react"
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

interface Reminder {
  id: number
  title: string
  case_subject: string
  suit_number: string
  reminder_date: string
}

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userRole, setUserRole] = useState<string>("")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCases()
    if (userRole !== "admin") {
      fetchReminders()
    }
  }, [search, statusFilter, userRole])

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        limit: "10",
      })

      const response = await fetch(`/api/cases?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases)
        setUserRole(data.userRole)

        // Calculate stats
        const total = data.pagination.total
        const active = data.cases.filter((c: Case) => c.status === "active").length
        const pending = data.cases.filter((c: Case) => c.status === "pending").length
        const completed = data.cases.filter((c: Case) => c.status === "completed").length

        setStats({ total, active, pending, completed })
      }
    } catch (error) {
      toast({ title: "Error fetching cases", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/reminders")
      if (response.ok) {
        const data = await response.json()
        setReminders(data.reminders.slice(0, 5)) // Show only 5 upcoming reminders
      }
    } catch (error) {
      console.error("Error fetching reminders:", error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === "admin" ? "Admin Dashboard" : "My Case Portfolio"}
          </h1>
          <p className="text-gray-600 mt-2">
            {userRole === "admin" ? "Overview of all cases in the system" : "Manage your case files and track progress"}
          </p>
        </div>
        {userRole !== "admin" && (
          <Link href="/cases/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Case
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "admin" ? "Total Cases" : "My Case Files"}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Cases</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <div className={`grid grid-cols-1 ${userRole !== "admin" ? "lg:grid-cols-3" : ""} gap-8`}>
        {/* Cases List */}
        <div className={userRole !== "admin" ? "lg:col-span-2" : ""}>
          <Card>
            <CardHeader>
              <CardTitle>{userRole === "admin" ? "All Cases in System" : "My Recent Case Files"}</CardTitle>
              <CardDescription>
                {userRole === "admin"
                  ? "Cases created by all attorneys in the system"
                  : "Your most recently added case files"}
              </CardDescription>

              {/* Filters */}
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search cases..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cases.map((case_) => (
                  <Link key={case_.id} href={`/cases/${case_.id}`}>
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{case_.suit_number}</h3>
                          <p className="text-gray-600 text-sm">File: {case_.file_number}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                          <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                        </div>
                      </div>
                      <p className="text-gray-800 mb-2">{case_.subject}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Court/Authority: {case_.assigning_officer}</span>
                        <span>Date: {new Date(case_.date_assigned).toLocaleDateString()}</span>
                      </div>
                      {userRole === "admin" && case_.assigned_to_name && (
                        <p className="text-sm text-gray-500 mt-1">Attorney: {case_.assigned_to_name}</p>
                      )}
                    </div>
                  </Link>
                ))}

                {cases.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {userRole === "admin" ? (
                      "No cases found in the system"
                    ) : (
                      <div>
                        <p className="mb-4">No case files found</p>
                        <Link href="/cases/new">
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Case
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reminders Sidebar - Only for non-admin users */}
        {userRole !== "admin" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Upcoming Reminders
                </CardTitle>
                <CardDescription>Your scheduled case reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-medium">{reminder.title}</h4>
                      <p className="text-sm text-gray-600">{reminder.case_subject}</p>
                      <p className="text-xs text-gray-500">
                        {reminder.suit_number} • {new Date(reminder.reminder_date).toLocaleString()}
                      </p>
                    </div>
                  ))}

                  {reminders.length === 0 && (
                    <div className="text-center py-4 text-gray-500">No upcoming reminders</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Users, FileText, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  totalCases: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCases: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      // Fetch users count
      const usersResponse = await fetch("/api/users")
      const usersData = await usersResponse.json()

      // Fetch cases count
      const casesResponse = await fetch("/api/cases")
      const casesData = await casesResponse.json()

      // Fetch access requests
      const requestsResponse = await fetch("/api/admin/access-requests")
      const requestsData = await requestsResponse.json()

      const pendingRequests = requestsData.requests?.filter((r: any) => r.status === "pending").length || 0
      const approvedRequests = requestsData.requests?.filter((r: any) => r.status === "approved").length || 0
      const rejectedRequests = requestsData.requests?.filter((r: any) => r.status === "rejected").length || 0

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalCases: casesData.pagination?.total || 0,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
      })
    } catch (error) {
      toast({ title: "Error fetching admin statistics", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and administration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active attorneys in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">Cases in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Access Requests Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Access Requests Overview
            </CardTitle>
            <CardDescription>Summary of user access requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span>Pending</span>
                </div>
                <span className="font-semibold text-yellow-600">{stats.pendingRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Approved</span>
                </div>
                <span className="font-semibold text-green-600">{stats.approvedRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Rejected</span>
                </div>
                <span className="font-semibold text-red-600">{stats.rejectedRequests}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/admin/access-requests">
                <Button className="w-full justify-start" variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Manage Access Requests
                  {stats.pendingRequests > 0 && (
                    <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {stats.pendingRequests}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/cases">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Cases
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current system status and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">User Management</h4>
              <p className="text-sm text-gray-600 mb-2">
                Total of {stats.totalUsers} active attorneys using the system
              </p>
              <p className="text-sm text-gray-600">{stats.pendingRequests} access requests awaiting your review</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Case Management</h4>
              <p className="text-sm text-gray-600 mb-2">{stats.totalCases} total cases registered in the system</p>
              <p className="text-sm text-gray-600">Cases are managed individually by each attorney</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

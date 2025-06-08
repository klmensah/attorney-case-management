"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { UsersIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

// Simple components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children }) => <div className="px-6 py-4 border-b border-gray-200">{children}</div>

const CardContent = ({ children }) => <div className="px-6 py-4">{children}</div>

const CardTitle = ({ children }) => <h3 className="text-lg font-semibold text-gray-900">{children}</h3>

const Button = ({ children, href, className = "" }) => {
  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
      >
        {children}
      </Link>
    )
  }
  return (
    <button
      className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    totalCases: 0,
    activeCases: 0,
  })

  useEffect(() => {
    // Fetch admin stats
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // You can implement these API calls
      setStats({
        totalUsers: 25,
        pendingRequests: 3,
        totalCases: 150,
        activeCases: 45,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your application and users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <ClockIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCases}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Manage user access requests and permissions</p>
            <Button href="/admin/access-requests">
              <UsersIcon className="w-4 h-4 mr-2" />
              View Access Requests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Monitor system performance and activity</p>
            <Button href="/dashboard">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

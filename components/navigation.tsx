"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, FileText, Bell, Home, Scale, UserCheck, User } from "lucide-react"
import Link from "next/link"

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if user is logged in by checking for auth token
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        // User not authenticated
      }
    }

    if (mounted && pathname !== "/login") {
      checkAuth()
    }
  }, [pathname, mounted])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null
  }

  // Don't show navigation on login page or if no user
  if (pathname === "/login" || !user) {
    return null
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">CaseManager</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard">
                <Button variant={pathname === "/dashboard" ? "default" : "ghost"} size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/cases">
                <Button variant={pathname.startsWith("/cases") ? "default" : "ghost"} size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  {user?.role === "admin" ? "All Cases" : "My Cases"}
                </Button>
              </Link>
              {user?.role !== "admin" && (
                <Link href="/reminders">
                  <Button variant={pathname === "/reminders" ? "default" : "ghost"} size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Reminders
                  </Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link href="/admin/access-requests">
                  <Button variant={pathname.startsWith("/admin") ? "default" : "ghost"} size="sm">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Scale } from "lucide-react"

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [requestData, setRequestData] = useState({ email: "", name: "", message: "" })
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      console.log("Attempting login...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      console.log("Login response status:", response.status)

      if (response.ok) {
        setMessage("Login successful!")
        window.location.href = "/dashboard"
      } else {
        const error = await response.json()
        setMessage(`Login failed: ${error.error}`)
      }
    } catch (error) {
      console.error("Login error:", error)
      setMessage("Network error during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      console.log("Submitting access request...")
      console.log("Request data:", requestData)

      const response = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log("Access request response status:", response.status)

      const result = await response.json()
      console.log("Access request response:", result)

      if (response.ok) {
        setMessage("Access request submitted successfully!")
        setRequestData({ email: "", name: "", message: "" })
      } else {
        setMessage(`Request failed: ${result.error}`)
      }
    } catch (error) {
      console.error("Access request error:", error)
      setMessage(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Scale className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Attorney Case Management</h2>
          <p className="mt-2 text-sm text-gray-600">Manage your legal cases efficiently</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md ${message.includes("successful") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="request">Request Access</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle>Request Access</CardTitle>
                <CardDescription>Submit a request to gain access to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestAccess} className="space-y-4">
                  <div>
                    <Label htmlFor="req-name">Full Name</Label>
                    <Input
                      id="req-name"
                      type="text"
                      value={requestData.name}
                      onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="req-email">Email</Label>
                    <Input
                      id="req-email"
                      type="email"
                      value={requestData.email}
                      onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      value={requestData.message}
                      onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                      placeholder="Please explain why you need access..."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

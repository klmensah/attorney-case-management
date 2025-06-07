import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/navigation"
import "../lib/supabase-storage" // Initialize storage on app startup

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Attorney Case Management System",
  description: "Comprehensive case management system for legal professionals",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <div className="min-h-screen bg-background">
            <Navigation />
            <main>{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

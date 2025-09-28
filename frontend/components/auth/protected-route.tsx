"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "officer"
  fallbackPath?: string
}

export function ProtectedRoute({ children, requiredRole, fallbackPath = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath)
        return
      }

      if (requiredRole && role !== requiredRole) {
        // Redirect to appropriate dashboard based on actual role
        if (role === "admin") {
          router.push("/admin")
        } else if (role === "officer") {
          router.push("/officer")
        } else {
          router.push(fallbackPath)
        }
        return
      }
    }
  }, [isAuthenticated, role, isLoading, requiredRole, router, fallbackPath])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}

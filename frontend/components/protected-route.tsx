"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { TokenManager } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "officer"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth()
  const router = useRouter()

  console.log("[v0] ProtectedRoute - Auth state:", { isAuthenticated, isLoading, role, requiredRole })

  useEffect(() => {
    if (!isLoading) {
      console.log("[v0] ProtectedRoute - Checking access...")

      if (!isAuthenticated) {
        console.log("[v0] ProtectedRoute - Not authenticated, redirecting to login")
        router.push("/login")
        return
      }

      if (requiredRole && role !== requiredRole) {
        console.log("[v0] ProtectedRoute - Role mismatch. Required:", requiredRole, "Actual:", role)
        
        // Additional token validation to prevent stale role issues
        const accessToken = TokenManager.getAccessToken()
        if (accessToken && !TokenManager.isTokenExpired(accessToken)) {
          const tokenRole = TokenManager.getUserRole(accessToken)
          console.log("[v0] ProtectedRoute - Token role verification:", tokenRole)
          
          // Use token-based role if there's a mismatch
          const actualRole = tokenRole || role
          
          if (actualRole === "admin") {
            console.log("[v0] ProtectedRoute - Redirecting to admin dashboard")
            router.push("/admin")
          } else if (actualRole === "officer") {
            console.log("[v0] ProtectedRoute - Redirecting to officer dashboard")  
            router.push("/officer")
          } else {
            console.log("[v0] ProtectedRoute - Unknown role, redirecting to login")
            router.push("/login")
          }
        } else {
          console.log("[v0] ProtectedRoute - Invalid token, redirecting to login")
          router.push("/login")
        }
        return
      }

      console.log("[v0] ProtectedRoute - Access granted")
    }
  }, [isAuthenticated, isLoading, role, requiredRole, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

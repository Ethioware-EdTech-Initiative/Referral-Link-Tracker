"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { TokenManager, type User } from "@/lib/auth"
import { apiClient } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  role: "admin" | "officer" | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasCheckedAuthRef = useRef(false)
  const router = useRouter()

  const isAuthenticated = !!user
  const role = user ? (user.is_staff ? "admin" : "officer") : null

  console.log("[v0] Auth state:", { user, isAuthenticated, role, isLoading })

  const checkAuthStatus = useCallback(async () => {
    if (hasCheckedAuthRef.current) return

    console.log("[v0] Checking auth status...")

    try {
      const accessToken = TokenManager.getAccessToken()
      console.log("[v0] Access token exists:", !!accessToken)

      if (!accessToken || TokenManager.isTokenExpired(accessToken)) {
        // Try to refresh token
        const refreshToken = TokenManager.getRefreshToken()
        if (refreshToken) {
          console.log("[v0] Attempting token refresh...")
          const refreshResponse = await fetch(
            "https://referral-link-tracker.vercel.app/alxET-rt-api/auth/token/refresh/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh: refreshToken }),
            },
          )

          if (refreshResponse.ok) {
            const data = await refreshResponse.json()
            TokenManager.setTokens({
              access: data.access,
              refresh: refreshToken,
            })
            await loadUserFromToken(data.access)
          } else {
            console.log("[v0] Token refresh failed")
            TokenManager.clearTokens()
          }
        } else {
          console.log("[v0] No refresh token available")
        }
      } else {
        console.log("[v0] Loading user from existing token...")
        await loadUserFromToken(accessToken)
      }
    } catch (error) {
      console.error("[v0] Auth check failed:", error)
      TokenManager.clearTokens()
    } finally {
      setIsLoading(false)
      hasCheckedAuthRef.current = true
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const loadUserFromToken = async (token: string) => {
    const decoded = TokenManager.decodeToken(token)
    console.log("[v0] Decoded token:", decoded)

    if (decoded) {
      const userData: User = {
        id: decoded.user_id,
        email: decoded.email || "",
        full_name: decoded.full_name || "",
        is_staff: decoded.is_staff || false,
        must_change_password: decoded.must_change_password || false,
        is_active: true,
        date_joined: new Date().toISOString(),
      }
      console.log("[v0] Setting user data:", userData)
      console.log("[v0] User is_staff:", userData.is_staff)
      setUser(userData)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      console.log("[v0] Attempting login for:", email)

      const response = await apiClient.login(email, password)

      console.log("[v0] Full login response:", response)
      console.log("[v0] Response data:", response.data)
      console.log("[v0] Response status:", response.status)

      if (response.data) {
        console.log("[v0] Login response data:", response.data)

        if (response.data.tokens?.access && response.data.tokens?.refresh) {
          console.log("[v0] Tokens found in nested tokens object")
          TokenManager.setTokens({
            access: response.data.tokens.access,
            refresh: response.data.tokens.refresh,
          })

          if (response.data.user) {
            console.log("[v0] Setting user data from response:", response.data.user)
            setUser(response.data.user)
          } else {
            // Fallback to loading from token if user data not in response
            await loadUserFromToken(response.data.tokens.access)
          }

          const userRole = response.data.user?.is_staff ? "admin" : "officer"
          console.log("[v0] User role from response:", userRole)

          if (userRole === "admin") {
            console.log("[v0] Redirecting to admin dashboard")
            router.push("/admin")
          } else {
            console.log("[v0] Redirecting to officer dashboard")
            router.push("/officer")
          }

          return { success: true }
        } else {
          console.log("[v0] No tokens in response, checking if backend returned different format")
          console.log("[v0] Available keys in response.data:", Object.keys(response.data))

          return {
            success: false,
            error: "Login successful but no authentication tokens received",
          }
        }
      } else {
        console.log("[v0] Login failed:", response.error)
        return {
          success: false,
          error: response.error || "Login failed",
        }
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      TokenManager.clearTokens()
      setUser(null)
      hasCheckedAuthRef.current = false
      router.push("/login")
    }
  }

  const refreshUser = async () => {
    hasCheckedAuthRef.current = false
    await checkAuthStatus()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        role,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

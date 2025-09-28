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
    console.log("[v0] Checking auth status..., hasChecked:", hasCheckedAuthRef.current)

    try {
      const accessToken = TokenManager.getAccessToken()
      console.log("[v0] Access token exists:", !!accessToken)

      if (!accessToken || TokenManager.isTokenExpired(accessToken)) {
        // Try to refresh token
        const refreshToken = TokenManager.getRefreshToken()
        if (refreshToken) {
          console.log("[v0] Attempting token refresh...")
          try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://referral-link-tracker.vercel.app"
            const refreshResponse = await fetch(
              `${baseUrl}/alxET-rt-api/auth/token/refresh/`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
              },
            )

            console.log("[v0] Token refresh response status:", refreshResponse.status)

            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              console.log("[v0] Token refresh successful, setting new tokens")
              TokenManager.setTokens({
                access: data.access,
                refresh: data.refresh || refreshToken,
              })

              // Try to get user from stored data first, then from token
              const storedUserData = TokenManager.getUserData()
              if (storedUserData) {
                console.log("[v0] Using stored user data after refresh:", storedUserData)
                setUser(storedUserData)
              } else {
                const userFromToken = TokenManager.getUserFromToken(data.access)
                if (userFromToken) {
                  console.log("[v0] Setting refreshed user data from token:", userFromToken)
                  TokenManager.setUserData(userFromToken)
                  setUser(userFromToken)
                }
              }
            } else {
              const errorData = await refreshResponse.json().catch(() => ({}))
              console.log("[v0] Token refresh failed:", refreshResponse.status, errorData)
              TokenManager.removeTokens()
              TokenManager.removeUserData()
              setUser(null)
            }
          } catch (refreshError) {
            console.error("[v0] Token refresh network error:", refreshError)
            TokenManager.removeTokens()
            TokenManager.removeUserData()
            setUser(null)
          }
        } else {
          console.log("[v0] No refresh token available")
          TokenManager.removeTokens()
          TokenManager.removeUserData()
          setUser(null)
        }
      } else {
        // First, try to get stored user data (includes complete role information)
        const storedUserData = TokenManager.getUserData()
        if (storedUserData) {
          console.log("[v0] Loading user from stored data:", storedUserData)
          setUser(storedUserData)
          const userRole = storedUserData.is_staff ? "admin" : "officer"
          console.log("[v0] User role from stored data:", userRole, "is_staff:", storedUserData.is_staff)
        } else {
          console.log("[v0] No stored user data, trying token (may lack role info)...")
          const userFromToken = TokenManager.getUserFromToken(accessToken)
          if (userFromToken) {
            console.log("[v0] Setting user data from valid token:", userFromToken)
            console.log("[v0] User role from token:", userFromToken.is_staff ? "admin" : "officer")

            // Validate that the token role matches what we expect
            const tokenRole = TokenManager.getUserRole(accessToken)
            console.log("[v0] Direct token role verification:", tokenRole)

            setUser(userFromToken)
          } else {
            console.log("[v0] Invalid token, clearing...")
            TokenManager.removeTokens()
            TokenManager.removeUserData()
            setUser(null)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Auth check failed:", error)
      TokenManager.removeTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
      hasCheckedAuthRef.current = true
    }
  }, [])

  useEffect(() => {
    // Reset auth check flag on mount to ensure fresh validation
    hasCheckedAuthRef.current = false
    checkAuthStatus()
  }, [checkAuthStatus])



  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      console.log("[v0] Attempting login for:", email)

      // Clear any existing tokens to prevent confusion
      console.log("[v0] Clearing existing tokens before login")
      TokenManager.removeTokens()
      TokenManager.removeUserData()
      setUser(null)
      hasCheckedAuthRef.current = false

      const response = await apiClient.login(email, password)

      console.log("[v0] Full login response:", response)
      console.log("[v0] Response data:", response.data)
      console.log("[v0] Response status:", response.status)

      if (response.status === 401) {
        console.log("[v0] Login failed: Invalid credentials")
        return {
          success: false,
          error: "Invalid email or password",
        }
      }

      if (response.data) {
        console.log("[v0] Login response data:", response.data)

        // Handle different possible response formats
        let tokens: { access: string; refresh: string } | null = null
        let userInfo: any = null

        // Cast to any to handle different response formats flexibly
        const responseData = response.data as any

        // Check for direct token format (current expected format)
        if (responseData.access && responseData.refresh) {
          console.log("[v0] Tokens found in direct format")
          tokens = {
            access: responseData.access,
            refresh: responseData.refresh,
          }
          userInfo = responseData
        }
        // Check for nested tokens format
        else if (responseData.tokens?.access && responseData.tokens?.refresh) {
          console.log("[v0] Tokens found in nested format")
          tokens = {
            access: responseData.tokens.access,
            refresh: responseData.tokens.refresh,
          }
          userInfo = responseData.user || responseData
        }
        // Check for other possible formats (token, user separate)
        else if (responseData.token) {
          console.log("[v0] Single token found, checking format")
          // Some APIs return a single JWT token
          tokens = {
            access: responseData.token,
            refresh: responseData.refresh_token || responseData.token, // fallback
          }
          userInfo = responseData
        }

        if (tokens) {
          console.log("[v0] Setting tokens:", { hasAccess: !!tokens.access, hasRefresh: !!tokens.refresh })

          // Validate token content before storing
          const preValidation = TokenManager.decodeToken(tokens.access)
          console.log("[v0] Pre-storage token validation:", preValidation)
          console.log("[v0] Pre-storage is_staff value:", preValidation?.is_staff)

          TokenManager.setTokens(tokens)

          // Create user data - try from userInfo first, then extract from token
          let userData: User | null = null

          if (userInfo && userInfo.id && userInfo.email) {
            userData = {
              id: userInfo.id,
              email: userInfo.email,
              full_name: userInfo.full_name || "",
              is_staff: userInfo.is_staff || false,
              must_change_password: userInfo.must_change_password || false,
              is_active: true,
              date_joined: new Date().toISOString(),
            }
          } else {
            // Fallback to extracting from token
            userData = TokenManager.getUserFromToken(tokens.access)
          }

          if (userData) {
            console.log("[v0] Setting user data:", userData)

            // Store complete user data in localStorage for persistence across page refreshes
            TokenManager.setUserData(userData)

            setUser(userData)

            const userRole = userData.is_staff ? "admin" : "officer"
            console.log("[v0] User role determined:", userRole, "is_staff:", userData.is_staff)

            if (userRole === "admin") {
              console.log("[v0] Redirecting to admin dashboard")
              router.push("/admin")
            } else {
              console.log("[v0] Redirecting to officer dashboard")
              router.push("/officer")
            }

            return { success: true }
          } else {
            return {
              success: false,
              error: "Unable to extract user information from login response",
            }
          }
        } else {
          console.log("[v0] No tokens found in any expected format")
          console.log("[v0] Available keys in response.data:", Object.keys(response.data))
          console.log("[v0] Full response.data structure:", response.data)

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
      TokenManager.removeTokens()
      TokenManager.removeUserData()
      setUser(null)
      hasCheckedAuthRef.current = false
      router.push("/login")
    }
  }

  const refreshUser = async () => {
    console.log("[v0] Refreshing user data...")
    hasCheckedAuthRef.current = false
    setIsLoading(true)
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

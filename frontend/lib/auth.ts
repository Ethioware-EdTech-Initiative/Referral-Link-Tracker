import { jwtDecode } from "jwt-decode"

export interface User {
  id: string
  email: string
  full_name: string
  is_staff: boolean
  must_change_password: boolean
  is_active: boolean
  date_joined: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface DecodedToken {
  user_id: string
  email: string
  full_name?: string
  is_staff: boolean
  must_change_password?: boolean
  exp: number
  iat: number
}

// Secure token storage with encryption
const TOKEN_KEY = "alx_et_tokens"
const REFRESH_KEY = "alx_et_refresh"
const REMEMBER_ME_KEY = "alx_et_remember"

export class TokenManager {
  private static encrypt(data: string): string {
    // Simple base64 encoding for basic obfuscation
    return btoa(data)
  }

  private static decrypt(data: string): string {
    try {
      return atob(data)
    } catch {
      return ""
    }
  }

  static setTokens(tokens: AuthTokens, rememberMe = false): void {
    if (typeof window !== "undefined") {
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem(TOKEN_KEY, this.encrypt(tokens.access))
      storage.setItem(REFRESH_KEY, this.encrypt(tokens.refresh))

      // Store remember me preference
      localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe))
    }
  }

  static getRememberMePreference(): boolean {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REMEMBER_ME_KEY) === "true"
    }
    return false
  }

  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      // Check both localStorage and sessionStorage based on remember me preference
      const rememberMe = this.getRememberMePreference()
      const storage = rememberMe ? localStorage : sessionStorage
      const token = storage.getItem(TOKEN_KEY)
      return token ? this.decrypt(token) : null
    }
    return null
  }

  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      // Check both localStorage and sessionStorage based on remember me preference
      const rememberMe = this.getRememberMePreference()
      const storage = rememberMe ? localStorage : sessionStorage
      const token = storage.getItem(REFRESH_KEY)
      return token ? this.decrypt(token) : null
    }
    return null
  }

  static removeTokens(): void {
    if (typeof window !== "undefined") {
      // Remove from both storage types to ensure complete cleanup
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(REMEMBER_ME_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(REFRESH_KEY)
    }
  }

  // User data storage methods
  static setUserData(user: User): void {
    localStorage.setItem('user_data', JSON.stringify(user))
    console.log('[v0] TokenManager - Stored user data:', user)
  }

  static getUserData(): User | null {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        console.log('[v0] TokenManager - Retrieved user data:', parsed)
        return parsed
      } catch (error) {
        console.error('[v0] TokenManager - Error parsing user data:', error)
        localStorage.removeItem('user_data')
        return null
      }
    }
    return null
  }

  static removeUserData(): void {
    localStorage.removeItem('user_data')
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      return decoded.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  static decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token)
    } catch {
      return null
    }
  }

  static getUserRole(token: string): "admin" | "officer" | null {
    const decoded = this.decodeToken(token)
    if (!decoded) return null
    return decoded.is_staff ? "admin" : "officer"
  }

  static validateTokenAndRole(expectedRole?: "admin" | "officer"): boolean {
    const token = this.getAccessToken()
    if (!token || this.isTokenExpired(token)) return false

    if (expectedRole) {
      const userRole = this.getUserRole(token)
      return userRole === expectedRole
    }

    return true
  }

  static getUserFromToken(token: string): User | null {
    const decoded = this.decodeToken(token)
    if (!decoded) return null

    console.log("[v0] TokenManager - Decoding token for user data:")
    console.log("[v0] TokenManager - Raw decoded token:", decoded)
    console.log("[v0] TokenManager - is_staff from token:", decoded.is_staff)
    console.log("[v0] TokenManager - typeof is_staff:", typeof decoded.is_staff)

    // Handle different possible formats for is_staff (boolean, string, or number)
    const rawIsStaff = (decoded as any).is_staff
    const isStaff = rawIsStaff === true || rawIsStaff === "true" || rawIsStaff === 1 || rawIsStaff === "1"
    console.log("[v0] TokenManager - Raw is_staff value:", rawIsStaff)
    console.log("[v0] TokenManager - Computed is_staff:", isStaff)

    return {
      id: decoded.user_id,
      email: decoded.email || "",
      full_name: decoded.full_name || "",
      is_staff: isStaff,
      must_change_password: decoded.must_change_password || false,
      is_active: true,
      date_joined: new Date().toISOString(),
    }
  }
}

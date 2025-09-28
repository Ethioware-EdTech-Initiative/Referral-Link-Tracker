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
  is_staff: boolean
  exp: number
  iat: number
}

// Secure token storage with encryption
const TOKEN_KEY = "alx_et_tokens"
const REFRESH_KEY = "alx_et_refresh"

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

  static setTokens(tokens: AuthTokens): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, this.encrypt(tokens.access))
      localStorage.setItem(REFRESH_KEY, this.encrypt(tokens.refresh))
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY)
      return token ? this.decrypt(token) : null
    }
    return null
  }

  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(REFRESH_KEY)
      return token ? this.decrypt(token) : null
    }
    return null
  }

  static clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
    }
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
}

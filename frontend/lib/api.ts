import { TokenManager } from "./auth"

const BASE_URL = "https://referral-link-tracker.vercel.app"

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    // Get access token and add to headers
    const accessToken = TokenManager.getAccessToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (accessToken && !TokenManager.isTokenExpired(accessToken)) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle token refresh for 401 errors
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry the original request with new token
          headers.Authorization = `Bearer ${TokenManager.getAccessToken()}`
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          })

          if (retryResponse.ok) {
            const data = await retryResponse.json()
            return { data, status: retryResponse.status }
          }
        }
      }

      if (response.ok) {
        const data = await response.json()
        return { data, status: response.status }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.error || errorData.message || "Request failed",
          status: response.status,
        }
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 0,
      }
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/alxET-rt-api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        TokenManager.setTokens({
          access: data.access,
          refresh: refreshToken,
        })
        return true
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
    }

    // Clear tokens if refresh fails
    TokenManager.clearTokens()
    return false
  }

  // Auth endpoints
  async login(
    email: string,
    password: string,
  ): Promise<
    ApiResponse<{ access: string; refresh: string; email: string; is_staff: boolean; id: string; full_name: string }>
  > {
    return this.request("/alxET-rt-api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const refreshToken = TokenManager.getRefreshToken()
    const response = await this.request("/alxET-rt-api/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    })
    TokenManager.clearTokens()
    return response
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request("/alxET-rt-api/auth/change_password/", {
      method: "POST",
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    })
  }

  // Admin endpoints
  async getUsers(page?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = page ? `?page=${page}` : ""
    return this.request(`/alxET-rt-api/auth/users/${params}`)
  }

  async createUser(userData: {
    email: string
    full_name: string
    password: string
    is_staff: boolean
  }): Promise<ApiResponse<any>> {
    return this.request("/alxET-rt-api/auth/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse<any>> {
    return this.request(`/alxET-rt-api/auth/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/alxET-rt-api/auth/users/${id}/`, {
      method: "DELETE",
    })
  }

  // Admin dashboard endpoints
  async getAdminMetrics(): Promise<
    ApiResponse<{
      total_clicks: number
      verified_links: number
      officers: number
      campaigns: number
    }>
  > {
    return this.request("/alxET-rt-api/admin/admin-dash/metrics/")
  }

  async getAdminStats(): Promise<
    ApiResponse<{
      weekly_clicks: Array<{ date: string; clicks: number }>
      officer_activity: Array<{ officer: string; clicks: number }>
    }>
  > {
    return this.request("/alxET-rt-api/admin/admin-dash/stats/")
  }

  async getCampaigns(page?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = page ? `?page=${page}` : ""
    return this.request(`/alxET-rt-api/admin/admin-dash/campaigns/${params}`)
  }

  async createCampaign(campaignData: {
    name: string
    description: string
    start_date: string
    end_date: string
    is_active: boolean
  }): Promise<ApiResponse<any>> {
    return this.request("/alxET-rt-api/admin/admin-dash/campaigns/", {
      method: "POST",
      body: JSON.stringify(campaignData),
    })
  }

  async updateCampaign(id: string, campaignData: any): Promise<ApiResponse<any>> {
    return this.request(`/alxET-rt-api/admin/admin-dash/campaigns/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(campaignData),
    })
  }

  async deleteCampaign(id: string): Promise<ApiResponse> {
    return this.request(`/alxET-rt-api/admin/admin-dash/campaigns/${id}/`, {
      method: "DELETE",
    })
  }

  async getAssignments(page?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = page ? `?page=${page}` : ""
    return this.request(`/alxET-rt-api/admin/admin-dash/assignments/${params}`)
  }

  async createAssignment(assignmentData: {
    officer: string
    campaign: string
  }): Promise<ApiResponse<any>> {
    return this.request("/alxET-rt-api/admin/admin-dash/assignments/", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    })
  }

  async deleteAssignment(id: string): Promise<ApiResponse> {
    return this.request(`/alxET-rt-api/admin/admin-dash/assignments/${id}/`, {
      method: "DELETE",
    })
  }

  async getAdminLinks(page?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = page ? `?page=${page}` : ""
    return this.request(`/alxET-rt-api/admin/admin-dash/links/${params}`)
  }

  async createLink(linkData: {
    url: string
    campaign: string
    is_verified: boolean
  }): Promise<ApiResponse<any>> {
    return this.request("/alxET-rt-api/admin/admin-dash/links/", {
      method: "POST",
      body: JSON.stringify(linkData),
    })
  }

  async updateLink(id: string, linkData: any): Promise<ApiResponse<any>> {
    return this.request(`/alxET-rt-api/admin/admin-dash/links/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(linkData),
    })
  }

  async deleteLink(id: string): Promise<ApiResponse> {
    return this.request(`/alxET-rt-api/admin/admin-dash/links/${id}/`, {
      method: "DELETE",
    })
  }

  async getOfficers(page?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = page ? `?page=${page}` : ""
    return this.request(`/alxET-rt-api/admin/admin-dash/officers/${params}`)
  }

  // Officer dashboard endpoints
  async getOfficerClicks(): Promise<
    ApiResponse<{
      total_clicks: number
      verified_clicks: number
      unverified_clicks: number
      weekly_clicks: Array<{ date: string; clicks: number }>
    }>
  > {
    return this.request("/alxET-rt-api/officer/officer-dash/stats/")
  }

  async getOfficerLinks(page?: number): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = page ? `?page=${page}` : ""
    return this.request(`/alxET-rt-api/officer/officer-dash/links/${params}`)
  }
}

export const apiClient = new ApiClient(BASE_URL)

import { TokenManager } from "./auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://referral-link-tracker.vercel.app"

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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (accessToken && !TokenManager.isTokenExpired(accessToken)) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle token refresh for 401 errors (but not for auth endpoints to prevent loops)
      if (response.status === 401 && accessToken && !endpoint.includes('/auth/')) {
        console.log("[v0] Received 401, attempting token refresh for:", endpoint)
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry the original request with new token
          const newToken = TokenManager.getAccessToken()
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`
            console.log("[v0] Retrying request with refreshed token")
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            })

            if (retryResponse.ok) {
              // Handle 204 No Content responses (no body to parse)
              if (retryResponse.status === 204) {
                return { data: undefined, status: retryResponse.status }
              }
              const data = await retryResponse.json()
              return { data, status: retryResponse.status }
            } else {
              console.log("[v0] Retry request also failed:", retryResponse.status)
            }
          }
        } else {
          console.log("[v0] Token refresh failed, user needs to re-login")
        }
      }

      if (response.ok) {
        // Handle 204 No Content responses (no body to parse)
        if (response.status === 204) {
          return { data: undefined, status: response.status }
        }
        const data = await response.json()
        return { data, status: response.status }
      } else {
        const errorData = await response.json().catch(() => ({}))

        // Enhanced logging for 400 errors to see validation issues
        if (response.status === 400) {
          console.log('[API 400 ERROR] Full error response:', errorData)
          console.log('[API 400 ERROR] URL:', url)
          console.log('[API 400 ERROR] Method:', options.method)
          console.log('[API 400 ERROR] Body:', options.body)
        }

        return {
          error: errorData.error || errorData.message || JSON.stringify(errorData) || "Request failed",
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
    if (!refreshToken) {
      console.log("[v0] No refresh token available for refresh")
      return false
    }

    console.log("[v0] Attempting token refresh...")
    try {
      const response = await fetch(`${this.baseURL}/alxET-rt-api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      console.log("[v0] Refresh response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Token refresh successful")
        TokenManager.setTokens({
          access: data.access,
          refresh: data.refresh || refreshToken, // Use new refresh token if provided, otherwise keep current
        })
        return true
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] Token refresh failed:", response.status, errorData)
      }
    } catch (error) {
      console.error("[v0] Token refresh network error:", error)
    }

    // Clear tokens if refresh fails
    console.log("[v0] Clearing tokens due to refresh failure")
    TokenManager.removeTokens()
    TokenManager.removeUserData()
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
    const response = await this.request<{ message: string }>("/alxET-rt-api/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    })
    TokenManager.removeTokens()
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
    return this.request<PaginatedResponse<any>>(`/alxET-rt-api/auth/users/${params}`)
  }

  async getAllUsers(): Promise<ApiResponse<any[]>> {
    try {
      // Get all users by fetching multiple pages
      let allUsers: any[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await this.request<PaginatedResponse<any>>(`/alxET-rt-api/auth/users/?page=${page}`)
        if (response.error) {
          return {
            error: response.error,
            status: response.status
          }
        }

        allUsers = [...allUsers, ...(response.data?.results || [])]
        hasMore = !!response.data?.next
        page++
      }

      return {
        data: allUsers,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to fetch all users",
        status: 500
      }
    }
  }

  async getAllOfficers(): Promise<ApiResponse<any[]>> {
    try {
      // Get all officers by fetching multiple pages
      let allOfficers: any[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await this.request<PaginatedResponse<any>>(`/alxET-rt-api/admin/admin-dash/officers/?page=${page}`)
        if (response.error) {
          return {
            error: response.error,
            status: response.status
          }
        }

        allOfficers = [...allOfficers, ...(response.data?.results || [])]
        hasMore = !!response.data?.next
        page++
      }

      return {
        data: allOfficers,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to fetch all officers",
        status: 500
      }
    }
  }

  async getAllCampaigns(): Promise<ApiResponse<any[]>> {
    try {
      // Get all campaigns by fetching multiple pages
      let allCampaigns: any[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await this.request<PaginatedResponse<any>>(`/alxET-rt-api/admin/admin-dash/campaigns/?page=${page}`)
        if (response.error) {
          return {
            error: response.error,
            status: response.status
          }
        }

        allCampaigns = [...allCampaigns, ...(response.data?.results || [])]
        hasMore = !!response.data?.next
        page++
      }

      return {
        data: allCampaigns,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to fetch all campaigns",
        status: 500
      }
    }
  }

  async updateAssignment(id: string, data: any): Promise<ApiResponse> {
    // Remove id from the data object to avoid API conflicts
    const { id: _, ...bodyData } = data

    return this.request(`/alxET-rt-api/admin/admin-dash/assignments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(bodyData),
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  async getUserStats(): Promise<ApiResponse<{
    total_users: number
    total_admins: number
    total_officers: number
  }>> {
    try {
      // Get all users by fetching multiple pages to calculate statistics
      let allUsers: any[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await this.request<PaginatedResponse<any>>(`/alxET-rt-api/auth/users/?page=${page}`)
        if (response.error) {
          return response as ApiResponse<any>
        }

        allUsers = [...allUsers, ...(response.data?.results || [])]
        hasMore = !!response.data?.next
        page++
      }

      const totalUsers = allUsers.length
      const totalAdmins = allUsers.filter(user => user.is_staff).length
      const totalOfficers = allUsers.filter(user => !user.is_staff).length

      return {
        data: {
          total_users: totalUsers,
          total_admins: totalAdmins,
          total_officers: totalOfficers
        },
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to get user statistics",
        status: 500
      }
    }
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
    // Get metrics data and aggregate it since backend returns paginated DailyMetrics
    const metricsResponse = await this.request<PaginatedResponse<any>>("/alxET-rt-api/admin/admin-dash/metrics/")
    const campaignsResponse = await this.request<PaginatedResponse<any>>("/alxET-rt-api/admin/admin-dash/campaigns/")
    const officersResponse = await this.request<PaginatedResponse<any>>("/alxET-rt-api/admin/admin-dash/officers/")
    const linksResponse = await this.request<PaginatedResponse<any>>("/alxET-rt-api/admin/admin-dash/links/")

    if (metricsResponse.error) {
      return metricsResponse as ApiResponse<any>
    }

    // Aggregate metrics from daily metrics data
    const totalClicks = metricsResponse.data?.results?.reduce((sum: number, metric: any) => sum + (metric.total_clicks || 0), 0) || 0
    const verifiedLinks = linksResponse.data?.results?.filter((link: any) => link.is_active).length || 0

    return {
      data: {
        total_clicks: totalClicks,
        verified_links: verifiedLinks,
        officers: officersResponse.data?.count || 0,
        campaigns: campaignsResponse.data?.count || 0
      },
      status: 200
    }
  }

  async getAdminStats(): Promise<
    ApiResponse<{
      weekly_clicks: Array<{ date: string; clicks: number }>
      officer_activity: Array<{ officer: string; clicks: number }>
    }>
  > {
    try {
      // Get metrics data for weekly trends
      const metricsResponse = await this.request<PaginatedResponse<any>>("/alxET-rt-api/admin/admin-dash/metrics/")

      // Get links data for officer activity analysis
      const linksResponse = await this.request<PaginatedResponse<any>>("/alxET-rt-api/admin/admin-dash/links/")

      // Generate weekly clicks data from metrics
      let weeklyClicks = metricsResponse.data?.results?.map((metric: any) => ({
        date: metric.date || new Date().toISOString().split('T')[0],
        clicks: metric.total_clicks || 0
      })) || []

      // If no metrics data, create sample data for the last 7 days
      if (weeklyClicks.length === 0) {
        const today = new Date()
        weeklyClicks = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() - (6 - i))
          return {
            date: date.toISOString().split('T')[0],
            clicks: 0
          }
        })
      }

      // Generate officer activity from links data
      const officerClicksMap = new Map<string, number>()
      linksResponse.data?.results?.forEach((link: any) => {
        const officerName = link.officer?.full_name || 'Unknown'
        const clicks = link.click_count || 0
        officerClicksMap.set(officerName, (officerClicksMap.get(officerName) || 0) + clicks)
      })

      const officerActivity = Array.from(officerClicksMap.entries())
        .map(([officer, clicks]) => ({ officer, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10) // Top 10 officers

      return {
        data: {
          weekly_clicks: weeklyClicks,
          officer_activity: officerActivity
        },
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch admin stats',
        status: 500
      }
    }
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
    // Remove id from body data if it exists, since it's in the URL path
    const { id: _, ...bodyData } = campaignData

    // Fix date formatting - ensure dates match API expected format (remove milliseconds)
    if (bodyData.start_date) {
      bodyData.start_date = new Date(bodyData.start_date).toISOString().replace(/\\.\\d{3}Z$/, 'Z')
    }
    if (bodyData.end_date) {
      bodyData.end_date = new Date(bodyData.end_date).toISOString().replace(/\\.\\d{3}Z$/, 'Z')
    }

    // Remove debug logs in production
    // console.log('[API PATCH DEBUG] ID:', id)
    // console.log('[API PATCH DEBUG] Body data:', bodyData)

    const result = await this.request(`/alxET-rt-api/admin/admin-dash/campaigns/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(bodyData),
    })
    // console.log('[API PATCH DEBUG] Response:', result)
    return result
  }

  async deleteCampaign(id: string): Promise<ApiResponse> {
    console.log('[API DELETE DEBUG] Deleting campaign ID:', id)
    const result = await this.request(`/alxET-rt-api/admin/admin-dash/campaigns/${id}/`, {
      method: "DELETE",
    })
    console.log('[API DELETE DEBUG] Delete response:', result)
    return result
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
    officer: string
    campaign: string
  }): Promise<ApiResponse<any>> {
    return this.request("/alxET-rt-api/admin/admin-dash/links/gen-link/", {
      method: "POST",
      body: JSON.stringify(linkData),
    })
  }

  // Tentative link update method - testing if backend supports it
  async updateLink(id: string, linkData: { is_active?: boolean; revoke_at?: string | null }): Promise<ApiResponse<any>> {
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

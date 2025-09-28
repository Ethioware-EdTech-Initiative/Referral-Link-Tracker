// Centralized type definitions for API responses

export interface User {
  id: string
  email: string
  full_name: string
  is_staff: boolean
  must_change_password: boolean
  is_active: boolean
  date_joined: string
}

export interface Campaign {
  id: string
  name: string
  description: string
  start_date: string
  officers: string
  end_date: string
  is_active: boolean
  officer_count: number
  created_at: string
  updated_at: string
}

export interface Officer {
  id: string
  full_name: string
  email: string
}

export interface Assignment {
  id: string
  officer: Officer
  campaign: Campaign
  assigned_at: string
}

export interface Link {
  id: string
  url: string
  campaign?: Campaign
  is_verified: boolean
  created_at: string
}

export interface AdminMetrics {
  total_clicks: number
  verified_links: number
  officers: number
  campaigns: number
}

export interface AdminStats {
  weekly_clicks: Array<{
    date: string
    clicks: number
  }>
  officer_activity: Array<{
    officer: string
    clicks: number
  }>
}

export interface OfficerClicks {
  total_clicks: number
  verified_clicks: number
  unverified_clicks: number
  weekly_clicks: Array<{
    date: string
    clicks: number
  }>
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  email: string
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

export interface CreateUserRequest {
  email: string
  full_name: string
  password: string
  is_staff: boolean
}

export interface CreateCampaignRequest {
  name: string
  description: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface CreateAssignmentRequest {
  officer: string
  campaign: string
}

export interface CreateLinkRequest {
  url: string
  campaign: string
  is_verified: boolean
}

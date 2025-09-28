"use client"

import { useState } from "react"
import { apiClient, type ApiResponse } from "@/lib/api"

export interface UseMutationState<T> {
  data: T | null
  loading: boolean
  error: string | null
  mutate: (...args: any[]) => Promise<{ success: boolean; data?: T; error?: string }>
  reset: () => void
}

export function useMutation<T, TArgs extends any[]>(
  mutationFn: (...args: TArgs) => Promise<ApiResponse<T>>,
): UseMutationState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (...args: TArgs) => {
    try {
      setLoading(true)
      setError(null)

      const response = await mutationFn(...args)

      if (response.error) {
        setError(response.error)
        setData(null)
        return { success: false, error: response.error }
      } else {
        setData(response.data || null)
        return { success: true, data: response.data }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      setData(null)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  }
}

// Specific mutation hooks
export function useCreateUser() {
  return useMutation(
    (userData: {
      email: string
      full_name: string
      password: string
      is_staff: boolean
    }) => apiClient.createUser(userData),
  )
}

export function useUpdateUser() {
  return useMutation((id: string, userData: any) => apiClient.updateUser(id, userData))
}

export function useDeleteUser() {
  return useMutation((id: string) => apiClient.deleteUser(id))
}

export function useCreateCampaign() {
  return useMutation(
    (campaignData: {
      name: string
      description: string
      start_date: string
      end_date: string
      is_active: boolean
    }) => apiClient.createCampaign(campaignData),
  )
}

export function useUpdateCampaign() {
  return useMutation((id: string, campaignData: any) => apiClient.updateCampaign(id, campaignData))
}

export function useDeleteCampaign() {
  return useMutation((id: string) => apiClient.deleteCampaign(id))
}

export function useCreateAssignment() {
  return useMutation(
    (assignmentData: {
      officer: string
      campaign: string
    }) => apiClient.createAssignment(assignmentData),
  )
}

export function useDeleteAssignment() {
  return useMutation((id: string) => apiClient.deleteAssignment(id))
}

export function useCreateLink() {
  return useMutation(
    (linkData: {
      url: string
      campaign: string
      is_verified: boolean
    }) => apiClient.createLink(linkData),
  )
}

export function useUpdateLink() {
  return useMutation((id: string, linkData: any) => apiClient.updateLink(id, linkData))
}

export function useDeleteLink() {
  return useMutation((id: string) => apiClient.deleteLink(id))
}

export function useChangePassword() {
  return useMutation((oldPassword: string, newPassword: string) => apiClient.changePassword(oldPassword, newPassword))
}

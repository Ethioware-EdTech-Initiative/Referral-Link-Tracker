"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api"

export interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(apiCall: () => Promise<ApiResponse<T>>, dependencies: any[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const depsString = useMemo(() => JSON.stringify(dependencies), dependencies)

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()

      if (!mountedRef.current) return

      if (response.error) {
        setError(response.error)
        setData(null)
      } else {
        setData(response.data || null)
      }
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err.message : "An error occurred")
      setData(null)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [apiCall, depsString])

  useEffect(() => {
    mountedRef.current = true
    fetchData()

    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

export interface UsePaginatedApiState<T> {
  data: T[]
  loading: boolean
  error: string | null
  page: number
  totalCount: number
  hasNext: boolean
  hasPrevious: boolean
  nextPage: () => void
  previousPage: () => void
  setPage: (page: number) => void
  refetch: () => Promise<void>
}

export function usePaginatedApi<T>(
  apiCall: (page?: number) => Promise<ApiResponse<PaginatedResponse<T>>>,
  initialPage = 1,
): UsePaginatedApiState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const mountedRef = useRef(true)

  const fetchData = useCallback(
    async (pageNum: number = page) => {
      if (!mountedRef.current) return

      try {
        setLoading(true)
        setError(null)
        const response = await apiCall(pageNum)

        if (!mountedRef.current) return

        if (response.error) {
          setError(response.error)
          setData([])
        } else if (response.data) {
          setData(response.data.results)
          setTotalCount(response.data.count)
          setHasNext(!!response.data.next)
          setHasPrevious(!!response.data.previous)
        }
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err.message : "An error occurred")
        setData([])
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [apiCall, page],
  )

  useEffect(() => {
    mountedRef.current = true
    fetchData(page)

    return () => {
      mountedRef.current = false
    }
  }, [page])

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage((prev) => prev + 1)
    }
  }, [hasNext])

  const previousPage = useCallback(() => {
    if (hasPrevious) {
      setPage((prev) => Math.max(1, prev - 1))
    }
  }, [hasPrevious])

  const setPageNumber = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage))
  }, [])

  return {
    data,
    loading,
    error,
    page,
    totalCount,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    setPage: setPageNumber,
    refetch: () => fetchData(page),
  }
}

export interface MutationOptions<T = any> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

export function useCreateMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: MutationOptions<TData>,
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await mutationFn(variables)

        if (response.error) {
          setError(response.error)
          options?.onError?.(response.error)
        } else if (response.data !== undefined) {
          options?.onSuccess?.(response.data)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        options?.onError?.(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, options],
  )

  return {
    mutate,
    isLoading,
    error,
  }
}

export function useUpdateMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: MutationOptions<TData>,
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await mutationFn(variables)

        if (response.error) {
          setError(response.error)
          options?.onError?.(response.error)
        } else if (response.data !== undefined) {
          options?.onSuccess?.(response.data)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        options?.onError?.(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, options],
  )

  return {
    mutate,
    isLoading,
    error,
  }
}

export function useDeleteMutation<TData = any>(
  mutationFn: (id: string) => Promise<ApiResponse<TData>>,
  options?: MutationOptions<TData>,
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await mutationFn(id)

        if (response.error) {
          setError(response.error)
          options?.onError?.(response.error)
        } else {
          // For DELETE operations, success is indicated by no error (even if data is undefined)
          // DELETE typically returns 204 No Content, so data will be undefined
          options?.onSuccess?.(response.data as TData)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        options?.onError?.(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, options],
  )

  return {
    mutate,
    isLoading,
    error,
  }
}

export function useAdminMetrics() {
  const apiCall = useCallback(() => apiClient.getAdminMetrics(), [])
  return useApi(apiCall, [])
}

export function useAdminStats() {
  const apiCall = useCallback(() => apiClient.getAdminStats(), [])
  return useApi(apiCall, [])
}

export function useOfficerStats() {
  const apiCall = useCallback(() => apiClient.getOfficerStats(), [])
  return useApi(apiCall, [])
}

export function useOfficerCampaignStats() {
  const apiCall = useCallback(() => apiClient.getOfficerCampaignStats(), [])
  return useApi(apiCall, [])
}

export function useOfficerTimelineStats() {
  const apiCall = useCallback(() => apiClient.getOfficerTimelineStats(), [])
  return useApi(apiCall, [])
}

// Legacy hook for backward compatibility
export function useOfficerClicks() {
  const apiCall = useCallback(() => apiClient.getOfficerClicks(), [])
  return useApi(apiCall, [])
}

export function useCampaigns(page?: number) {
  const apiCall = useCallback((p?: number) => apiClient.getCampaigns(p), [])
  return usePaginatedApi(apiCall, page)
}

export function useUsers(page?: number) {
  const apiCall = useCallback((p?: number) => apiClient.getUsers(p), [])
  return usePaginatedApi(apiCall, page)
}

export function useAssignments(page?: number) {
  const apiCall = useCallback((p?: number) => apiClient.getAssignments(p), [])
  return usePaginatedApi(apiCall, page)
}

export function useAdminLinks(page?: number) {
  const apiCall = useCallback((p?: number) => apiClient.getAdminLinks(p), [])
  return usePaginatedApi(apiCall, page)
}

export function useOfficers(page?: number) {
  const apiCall = useCallback((p?: number) => apiClient.getOfficers(p), [])
  return usePaginatedApi(apiCall, page)
}

export const useOfficerLinks = (page: number = 1) => {
  const apiCall = useCallback((p?: number) => apiClient.getOfficerLinks(p), [])
  return usePaginatedApi(apiCall, page)
}

export const useUserStats = () => {
  const [data, setData] = useState<{
    total_users: number
    total_admins: number
    total_officers: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.getUserStats()
      if (response.error) {
        setError(response.error)
      } else {
        setData(response.data!)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { data, error, isLoading, refetch: fetchStats }
}

export function useAllUsers() {
  const apiCall = useCallback(() => apiClient.getAllUsers(), [])
  return useApi(apiCall, [])
}

export function useAllOfficers() {
  const apiCall = useCallback(() => apiClient.getAllOfficers(), [])
  return useApi(apiCall, [])
}

// Specific hook for assignment page that ensures only officers are returned
export function useOfficersForAssignment() {
  const { data: officersData, loading, error, refetch } = useApi(
    useCallback(() => apiClient.getAllOfficers(), []),
    []
  )

  // Filter to ensure only officers (non-staff users) are returned
  const officers = officersData?.filter((user: any) => !user.is_staff) || []

  return {
    data: officers,
    loading,
    error,
    refetch
  }
}

export function useAllCampaigns() {
  const apiCall = useCallback(() => apiClient.getAllCampaigns(), [])
  return useApi(apiCall, [])
}

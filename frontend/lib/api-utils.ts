// Utility functions for API operations

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function generateStrongPassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export function calculatePaginationInfo(currentPage: number, totalCount: number, pageSize = 10) {
  const totalPages = Math.ceil(totalCount / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return {
    totalPages,
    startItem,
    endItem,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  }
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function handleApiError(error: string | null): string {
  if (!error) return ""

  // Common error message mappings
  const errorMappings: Record<string, string> = {
    "Network error": "Unable to connect to server. Please check your internet connection.",
    "Request failed": "The request could not be completed. Please try again.",
    Unauthorized: "Your session has expired. Please log in again.",
    Forbidden: "You don't have permission to perform this action.",
    "Not found": "The requested resource was not found.",
    "Internal server error": "A server error occurred. Please try again later.",
  }

  return errorMappings[error] || error
}

export function sortByDate<T extends { created_at?: string; date_joined?: string }>(
  items: T[],
  field: keyof T = "created_at" as keyof T,
  order: "asc" | "desc" = "desc",
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(String(a[field]) || "").getTime()
    const dateB = new Date(String(b[field]) || "").getTime()

    return order === "desc" ? dateB - dateA : dateA - dateB
  })
}

export function filterByStatus<T extends { is_active?: boolean; is_verified?: boolean }>(
  items: T[],
  status: "active" | "inactive" | "verified" | "unverified" | "all" = "all",
): T[] {
  if (status === "all") return items

  return items.filter((item) => {
    switch (status) {
      case "active":
        return item.is_active === true
      case "inactive":
        return item.is_active === false
      case "verified":
        return item.is_verified === true
      case "unverified":
        return item.is_verified === false
      default:
        return true
    }
  })
}

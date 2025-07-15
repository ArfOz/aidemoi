/**
 * Utility functions for data management
 */

// Local storage utilities
export const storage = {
  /**
   * Get item from localStorage with JSON parsing
   */
  get<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === "undefined") {
      return defaultValue ?? null
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue ?? null
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error)
      return defaultValue ?? null
    }
  },

  /**
   * Set item in localStorage with JSON stringification
   */
  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error)
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error)
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage", error)
    }
  },
}

// Simple in-memory cache with TTL
class SimpleCache {
  private cache = new Map<string, { data: unknown; expiry: number }>()

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

// Export cache instance
export const cache = new SimpleCache()

// Debounce function for search and other operations
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
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

// Throttle function for API calls
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(amount)
}

// Format date
export function formatDate(
  date: string | Date,
  locale: string = "en-US"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj)
}

// Format relative time
export function formatRelativeTime(
  date: string | Date,
  locale: string = "en-US"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second")
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), "minute")
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), "hour")
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), "day")
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), "month")
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), "year")
  }
}

// Generate cache key for API requests
export function generateCacheKey(
  endpoint: string,
  params?: Record<string, unknown>
): string {
  if (!params) {
    return endpoint
  }

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key]
      return result
    }, {} as Record<string, unknown>)

  return `${endpoint}:${JSON.stringify(sortedParams)}`
}

// Retry function for failed requests
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }

    await new Promise((resolve) => setTimeout(resolve, delay))
    return retry(fn, retries - 1, delay * 2)
  }
}

// Check if string is valid email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check if string is valid phone number
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone)
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength - 3) + "..."
}

// Generate random ID
export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

// Sleep function for testing
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

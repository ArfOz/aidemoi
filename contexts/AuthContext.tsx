"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: number
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

interface Tokens {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

interface AuthContextType {
  user: User | null
  tokens: Tokens | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, tokens: Tokens) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<Tokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null && tokens !== null

  // Load auth data from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("auth_user")
      const storedTokens = localStorage.getItem("auth_tokens")

      if (storedUser && storedTokens) {
        setUser(JSON.parse(storedUser))
        setTokens(JSON.parse(storedTokens))
      }
    } catch (error) {
      console.error("Error loading auth data from localStorage:", error)
      // Clear corrupted data
      localStorage.removeItem("auth_user")
      localStorage.removeItem("auth_tokens")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (userData: User, tokenData: Tokens) => {
    try {
      setUser(userData)
      setTokens(tokenData)
      localStorage.setItem("auth_user", JSON.stringify(userData))
      localStorage.setItem("auth_tokens", JSON.stringify(tokenData))
    } catch (error) {
      console.error("Error storing auth data in localStorage:", error)
    }
  }

  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_tokens")
  }

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

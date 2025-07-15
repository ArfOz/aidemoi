/**
 * Data fetching functions for users and authentication
 */

import { apiAideMoi } from "./api"
import {
  RegisterUserData,
  LoginUserData,
  UpdateProfileData,
} from "./validation"

// User data types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  postalCode: string
  avatar?: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: string
}

// User API functions
export const userApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterUserData): Promise<AuthResponse> {
    const response = await apiAideMoi.post<AuthResponse>("/auth/register", data)

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to register user")
    }

    return response.data
  },

  /**
   * Login user
   */
  async login(data: LoginUserData): Promise<AuthResponse> {
    const response = await apiAideMoi.post<AuthResponse>("/auth/login", data)

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to login")
    }

    return response.data
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const response = await apiAideMoi.post("/auth/logout")

    if (!response.success) {
      throw new Error(response.error || "Failed to logout")
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiAideMoi.get<User>("/auth/profile")

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to get profile")
    }

    return response.data
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiAideMoi.put<User>("/auth/profile", data)

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to update profile")
    }

    return response.data
  },

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await apiAideMoi.post("/auth/change-password", {
      currentPassword,
      newPassword,
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to change password")
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const response = await apiAideMoi.post("/auth/reset-password", { email })

    if (!response.success) {
      throw new Error(response.error || "Failed to request password reset")
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiAideMoi.post("/auth/reset-password/confirm", {
      token,
      newPassword,
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to reset password")
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await apiAideMoi.post("/auth/verify-email", { token })

    if (!response.success) {
      throw new Error(response.error || "Failed to verify email")
    }
  },

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    const response = await apiAideMoi.post("/auth/resend-verification")

    if (!response.success) {
      throw new Error(response.error || "Failed to resend verification")
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiAideMoi.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to refresh token")
    }

    return response.data
  },

  /**
   * Get user by ID (admin function)
   */
  async getUser(id: string): Promise<User> {
    const response = await apiAideMoi.get<User>(`/users/${id}`)

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to get user")
    }

    return response.data
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await apiAideMoi.post<{ url: string }>(
      "/users/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to upload avatar")
    }

    return response.data.url
  },

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    const response = await apiAideMoi.delete("/users/account")

    if (!response.success) {
      throw new Error(response.error || "Failed to delete account")
    }
  },
}

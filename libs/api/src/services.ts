/**
 * Data fetching functions for services
 */

import { apiAideMoi, APIError } from './api';
import {
  CreateServiceData,
  UpdateServiceData,
  ServiceQueryData,
} from './validation';

// Type exports for use in components
export type { CreateServiceData, UpdateServiceData, ServiceQueryData };

// Service response types
export interface ServiceResponse {
  success: boolean;
  data?: Service;
  message?: string;
  error?: { code: number; message: string };
}

export interface ServicesResponse {
  success: boolean;
  data?: PaginatedServices;
  message?: string;
  error?: { code: number; message: string };
}

export interface CategoriesResponse {
  success: boolean;
  data?: ServiceCategory[];
  message?: string;
  error?: { code: number; message: string };
}

// PaginationResponse type definition
export interface PaginationResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: T[];
}

// Service data types
export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  location: string;
  postalCode: string;
  images?: string[];
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export type PaginatedServices = PaginationResponse<Service>;

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  serviceCount: number;
}

// Helper function to build query params
function buildQueryParams(query?: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }

  return params;
}

// Service API functions
export const serviceApi = {
  /**
   * Get all services with optional filtering
   */
  async getServices(query?: ServiceQueryData): Promise<PaginatedServices> {
    try {
      const params = buildQueryParams(query);
      const response = await apiAideMoi.get<ServicesResponse>(
        `/services?${params.toString()}`
      );

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to fetch services');
      }

      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Failed to fetch services'
      );
    }
  },

  /**
   * Get a single service by ID
   */
  async getService(id: string): Promise<Service> {
    try {
      const response = await apiAideMoi.get<ServiceResponse>(`/services/${id}`);

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to fetch service');
      }

      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Failed to fetch service'
      );
    }
  },

  /**
   * Create a new service
   */
  async createService(data: CreateServiceData): Promise<Service> {
    try {
      const response = await apiAideMoi.post<ServiceResponse>(
        '/services',
        data
      );

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to create service');
      }

      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Failed to create service'
      );
    }
  },

  /**
   * Update an existing service
   */
  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    try {
      const response = await apiAideMoi.put<ServiceResponse>(
        `/services/${id}`,
        data
      );

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to update service');
      }

      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Failed to update service'
      );
    }
  },

  /**
   * Delete a service
   */
  async deleteService(id: string): Promise<void> {
    try {
      const response = await apiAideMoi.delete<{
        success: boolean;
        message?: string;
      }>(`/services/${id}`);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to delete service');
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Failed to delete service'
      );
    }
  },

  /**
   * Get services by category
   */
  async getServicesByCategory(
    category: string,
    query?: Omit<ServiceQueryData, 'category'>
  ): Promise<PaginatedServices> {
    return this.getServices({ ...query, category });
  },

  /**
   * Get services by location
   */
  async getServicesByLocation(
    location: string,
    query?: Omit<ServiceQueryData, 'location'>
  ): Promise<PaginatedServices> {
    return this.getServices({ ...query, location });
  },

  /**
   * Get services by postal code
   */
  async getServicesByPostalCode(
    postalCode: string,
    query?: Omit<ServiceQueryData, 'postalCode'>
  ): Promise<PaginatedServices> {
    return this.getServices({ ...query, postalCode });
  },

  /**
   * Get user's services
   */
  async getUserServices(
    userId: string,
    query?: ServiceQueryData
  ): Promise<PaginatedServices> {
    try {
      const params = buildQueryParams(query);
      const response = await apiAideMoi.get<ServicesResponse>(
        `/users/${userId}/services?${params.toString()}`
      );

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to fetch user services');
      }

      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Failed to fetch user services'
      );
    }
  },

  /**
   * Get all service categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiAideMoi.get<CategoriesResponse>(
        '/services/categories'
      );

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to fetch categories');
      }

      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Failed to fetch categories'
      );
    }
  },

  /**
   * Search services
   */
  async searchServices(
    searchTerm: string,
    query?: ServiceQueryData
  ): Promise<PaginatedServices> {
    const params = buildQueryParams({ ...query, search: searchTerm });
    return this.getServices(Object.fromEntries(params.entries()));
  },
};

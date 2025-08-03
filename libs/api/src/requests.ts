/**
 * Data fetching functions for service requests
 */

import { apiAideMoi } from './api';
import { CreateRequestData, UpdateRequestData } from './validation';

// Request data types
export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  location: string;
  postalCode: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'cancelled';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRequests {
  requests: ServiceRequest[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request query interface
export interface RequestQuery {
  category?: string;
  location?: string;
  postalCode?: string;
  minBudget?: number;
  maxBudget?: number;
  priority?: 'low' | 'medium' | 'high';
  status?: 'active' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// Helper function to build query params
function buildQueryParams(query?: RequestQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  return params;
}

// Request API functions
export const requestApi = {
  /**
   * Get all requests with optional filtering
   */
  async getRequests(query?: RequestQuery): Promise<PaginatedRequests> {
    const params = buildQueryParams(query);
    const response = await apiAideMoi.get<PaginatedRequests>(
      `/requests?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(
        typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to fetch requests'
      );
    }

    return response.data;
  },

  /**
   * Get a single request by ID
   */
  async getRequest(id: string): Promise<ServiceRequest> {
    const response = await apiAideMoi.get<ServiceRequest>(`/requests/${id}`);

    if (!response.success || !response.data) {
      throw new Error(
        typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to fetch request'
      );
    }

    return response.data;
  },

  /**
   * Create a new request
   */
  async createRequest(data: CreateRequestData): Promise<ServiceRequest> {
    const response = await apiAideMoi.post<ServiceRequest>('/requests', data);

    if (!response.success || !response.data) {
      throw new Error(
        typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to create request'
      );
    }

    return response.data;
  },

  /**
   * Update an existing request
   */
  async updateRequest(
    id: string,
    data: UpdateRequestData
  ): Promise<ServiceRequest> {
    const response = await apiAideMoi.put<ServiceRequest>(
      `/requests/${id}`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(
        typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to update request'
      );
    }

    return response.data;
  },

  /**
   * Delete a request
   */
  async deleteRequest(id: string): Promise<void> {
    const response = await apiAideMoi.delete(`/requests/${id}`);

    if (!response.success) {
      throw new Error(
        typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to delete request'
      );
    }
  },

  /**
   * Get requests by category
   */
  async getRequestsByCategory(
    category: string,
    query?: Omit<RequestQuery, 'category'>
  ): Promise<PaginatedRequests> {
    return this.getRequests({ ...query, category });
  },

  /**
   * Get requests by location
   */
  async getRequestsByLocation(
    location: string,
    query?: Omit<RequestQuery, 'location'>
  ): Promise<PaginatedRequests> {
    return this.getRequests({ ...query, location });
  },

  /**
   * Get requests by postal code
   */
  async getRequestsByPostalCode(
    postalCode: string,
    query?: Omit<RequestQuery, 'postalCode'>
  ): Promise<PaginatedRequests> {
    return this.getRequests({ ...query, postalCode });
  },

  /**
   * Get user's requests
   */
  async getUserRequests(
    userId: string,
    query?: RequestQuery
  ): Promise<PaginatedRequests> {
    const params = buildQueryParams(query);
    const response = await apiAideMoi.get<PaginatedRequests>(
      `/users/${userId}/requests?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(
        typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to fetch user requests'
      );
    }

    return response.data;
  },

  /**
   * Search requests
   */
  async searchRequests(
    searchTerm: string,
    query?: RequestQuery
  ): Promise<PaginatedRequests> {
    const params = buildQueryParams({ ...query, search: searchTerm });
    const response = await apiAideMoi.get<PaginatedRequests>(
      `/requests/search?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(
        typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to search requests'
      );
    }

    return response.data;
  },

  /**
   * Get active requests
   */
  async getActiveRequests(
    query?: Omit<RequestQuery, 'status'>
  ): Promise<PaginatedRequests> {
    return this.getRequests({ ...query, status: 'active' });
  },

  /**
   * Mark request as completed
   */
  async completeRequest(id: string): Promise<ServiceRequest> {
    return this.updateRequest(id, { status: 'completed' });
  },

  /**
   * Cancel request
   */
  async cancelRequest(id: string): Promise<ServiceRequest> {
    return this.updateRequest(id, { status: 'cancelled' });
  },
};

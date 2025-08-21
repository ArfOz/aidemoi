/**
 * Data fetching functions for services
 */

import { apiAideMoi } from './api';
import {
  CreateServiceData,
  UpdateServiceData,
  ServiceQueryData,
} from './validation';

// Type exports for use in components
export type { CreateServiceData, UpdateServiceData, ServiceQueryData };

// PaginationResponse type definition (add or import as needed)
export interface PaginationResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data?: T[];
}

// Service data types - move these to interface.ts
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

export type PaginatedServices = PaginationResponse<Service> & {
  services: Service[];
};

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

// // Service API functions
// export const serviceApi = {
//   /**
//    * Get all services with optional filtering
//    */
//   async getServices(query?: ServiceQueryData): Promise<PaginatedServices> {
//     const params = buildQueryParams(query);
//     const response = await apiAideMoi.get<PaginatedServices>(
//       `/services?${params.toString()}`
//     );

//     if (!response.success || !response.data) {
//       throw new Error(
//         typeof response.error === 'string'
//           ? response.error
//           : response.error?.message || 'Failed to fetch services'
//       );
//     }

//     return response.data;
//   },

//   /**
//    * Get a single service by ID
//    */
//   async getService(id: string): Promise<Service> {
//     const response = await apiAideMoi.get<Service>(`/services/${id}`);

//     if (!response.success || !response.data) {
//       throw new Error(
//         typeof response.error === 'string'
//           ? response.error
//           : response.error?.message || 'Failed to fetch service'
//       );
//     }

//     return response.data;
//   },

//   /**
//    * Create a new service
//    */
//   async createService(data: CreateServiceData): Promise<Service> {
//     const response = await apiAideMoi.post<Service>('/services', data);

//     if (!response.success || !response.data) {
//       throw new Error(
//         typeof response.error === 'string'
//           ? response.error
//           : response.error?.message || 'Failed to create service'
//       );
//     }

//     return response.data;
//   },

//   /**
//    * Update an existing service
//    */
//   async updateService(id: string, data: UpdateServiceData): Promise<Service> {
//     const response = await apiAideMoi.put<Service>(`/services/${id}`, data);

//     if (!response.success || !response.data) {
//       throw new Error(
//         typeof response.error === 'string'
//           ? response.error
//           : response.error?.message || 'Failed to update service'
//       );
//     }

//     return response.data;
//   },

//   /**
//    * Delete a service
//    */
//   async deleteService(id: string): Promise<void> {
//     const response = await apiAideMoi.delete(`/services/${id}`);

//     if (!response.success) {
//       throw new Error(
//         typeof response.error === 'string'
//           ? response.error
//           : response.error?.message || 'Failed to delete service'
//       );
//     }
//   },

//   /**
//    * Get services by category
//    */
//   async getServicesByCategory(
//     category: string,
//     query?: Omit<ServiceQueryData, 'category'>
//   ): Promise<PaginatedServices> {
//     return this.getServices({ ...query, category });
//   },

//   /**
//    * Get services by location
//    */
//   async getServicesByLocation(
//     location: string,
//     query?: Omit<ServiceQueryData, 'location'>
//   ): Promise<PaginatedServices> {
//     return this.getServices({ ...query, location });
//   },

//   /**
//    * Get services by postal code
//    */
//   async getServicesByPostalCode(
//     postalCode: string,
//     query?: Omit<ServiceQueryData, 'postalCode'>
//   ): Promise<PaginatedServices> {
//     return this.getServices({ ...query, postalCode });
//   },

//   /**
//    * Get user's services
//    */
//   async getUserServices(
//     userId: string,
//     query?: ServiceQueryData
//   ): Promise<PaginatedServices> {
//     const params = buildQueryParams(query);
//     const response = await apiAideMoi.get<PaginatedServices>(
//       `/users/${userId}/services?${params.toString()}`
//     );

//     if (!response.success || !response.data) {
//       throw new Error(
//         typeof response.error === 'string'
//           ? response.error
//           : response.error?.message || 'Failed to fetch user services'
//       );
//     }

//     return response.data;
//   },

//   /**
//    * Get all service categories
//    */
//   async getCategories(): Promise<ServiceCategory[]> {
//     const response = await apiAideMoi.get<ServiceCategory[]>(
//       '/services/categories'
//     );

//     if (!response.success || !response.data) {
//       throw new Error(
//         typeof response.error === 'string'
//           ? response.error
//           : response.error?.message || 'Failed to fetch categories'
//       );
//     }

//     return response.data;
//   },

//   /**
//    * Search services
//    */
//   async searchServices(
//     searchTerm: string,
//     query?: ServiceQueryData
//   ): Promise<PaginatedServices> {
//     const params = buildQueryParams({ ...query, search: searchTerm });
//     const response = await apiAideMoi.get<PaginatedServices>(
//       `/services/search?${params.toString()}`
//     );

//     if (!response.success || !response.data) {
//       throw new Error(
//         typeof response.error === 'string'
//           ? response.error
//           : response.error?.message || 'Failed to search services'
//       );
//     }

//     return response.data;
//   },
// };

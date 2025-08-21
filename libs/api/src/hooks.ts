// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import {
//   serviceApi,
//   Service,
//   PaginatedServices,
//   ServiceCategory,
//   CreateServiceData,
//   UpdateServiceData,
//   ServiceQueryData,
//   APIError,
// } from '@api';

// // Hook for getting all services
// export function useServices(query?: ServiceQueryData) {
//   const [services, setServices] = useState<PaginatedServices | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchServices = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await serviceApi.getServices(query);
//       setServices(data);
//     } catch (err) {
//       const errorMessage =
//         err instanceof APIError
//           ? err.message
//           : err instanceof Error
//           ? err.message
//           : 'Failed to fetch services';
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [query]);

//   useEffect(() => {
//     fetchServices();
//   }, [fetchServices]);

//   return {
//     services,
//     loading,
//     error,
//     refetch: fetchServices,
//   };
// }

// // Hook for getting a single service
// export function useService(id: string) {
//   const [service, setService] = useState<Service | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchService = useCallback(async () => {
//     if (!id) return;

//     try {
//       setLoading(true);
//       setError(null);
//       const data = await serviceApi.getService(id);
//       setService(data);
//     } catch (err) {
//       const errorMessage =
//         err instanceof APIError
//           ? err.message
//           : err instanceof Error
//           ? err.message
//           : 'Failed to fetch service';
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchService();
//   }, [fetchService]);

//   return {
//     service,
//     loading,
//     error,
//     refetch: fetchService,
//   };
// }

// // Hook for service categories
// export function useServiceCategories() {
//   const [categories, setCategories] = useState<ServiceCategory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchCategories = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await serviceApi.getCategories();
//       setCategories(data);
//     } catch (err) {
//       const errorMessage =
//         err instanceof APIError
//           ? err.message
//           : err instanceof Error
//           ? err.message
//           : 'Failed to fetch categories';
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCategories();
//   }, [fetchCategories]);

//   return {
//     categories,
//     loading,
//     error,
//     refetch: fetchCategories,
//   };
// }

// // Hook for user's services
// export function useUserServices(userId: string, query?: ServiceQueryData) {
//   const [services, setServices] = useState<PaginatedServices | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchUserServices = useCallback(async () => {
//     if (!userId) return;

//     try {
//       setLoading(true);
//       setError(null);
//       const data = await serviceApi.getUserServices(userId, query);
//       setServices(data);
//     } catch (err) {
//       const errorMessage =
//         err instanceof APIError
//           ? err.message
//           : err instanceof Error
//           ? err.message
//           : 'Failed to fetch user services';
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [userId, query]);

//   useEffect(() => {
//     fetchUserServices();
//   }, [fetchUserServices]);

//   return {
//     services,
//     loading,
//     error,
//     refetch: fetchUserServices,
//   };
// }

// // Hook for service mutations (create, update, delete)
// export function useServiceMutations() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const createService = useCallback(
//     async (data: CreateServiceData): Promise<Service | null> => {
//       try {
//         setLoading(true);
//         setError(null);
//         const service = await serviceApi.createService(data);
//         return service;
//       } catch (err) {
//         const errorMessage =
//           err instanceof APIError
//             ? err.message
//             : err instanceof Error
//             ? err.message
//             : 'Failed to create service';
//         setError(errorMessage);
//         return null;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const updateService = useCallback(
//     async (id: string, data: UpdateServiceData): Promise<Service | null> => {
//       try {
//         setLoading(true);
//         setError(null);
//         const service = await serviceApi.updateService(id, data);
//         return service;
//       } catch (err) {
//         const errorMessage =
//           err instanceof APIError
//             ? err.message
//             : err instanceof Error
//             ? err.message
//             : 'Failed to update service';
//         setError(errorMessage);
//         return null;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const deleteService = useCallback(async (id: string): Promise<boolean> => {
//     try {
//       setLoading(true);
//       setError(null);
//       await serviceApi.deleteService(id);
//       return true;
//     } catch (err) {
//       const errorMessage =
//         err instanceof APIError
//           ? err.message
//           : err instanceof Error
//           ? err.message
//           : 'Failed to delete service';
//       setError(errorMessage);
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const clearError = useCallback(() => {
//     setError(null);
//   }, []);

//   return {
//     createService,
//     updateService,
//     deleteService,
//     loading,
//     error,
//     clearError,
//   };
// }

// // Hook for searching services
// export function useServiceSearch() {
//   const [results, setResults] = useState<PaginatedServices | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const searchServices = useCallback(
//     async (searchTerm: string, query?: ServiceQueryData) => {
//       if (!searchTerm.trim()) {
//         setResults(null);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);
//         const data = await serviceApi.searchServices(searchTerm, query);
//         setResults(data);
//       } catch (err) {
//         const errorMessage =
//           err instanceof APIError
//             ? err.message
//             : err instanceof Error
//             ? err.message
//             : 'Failed to search services';
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const clearSearch = useCallback(() => {
//     setResults(null);
//     setError(null);
//   }, []);

//   return {
//     results,
//     loading,
//     error,
//     searchServices,
//     clearSearch,
//   };
// }

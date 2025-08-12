// /**
//  * React hooks for data fetching
//  */

// import { useState, useEffect, useCallback } from 'react';
// import {
//   serviceApi,
//   Service,
//   PaginatedServices,
//   ServiceQueryData,
// } from './services';
// import { userApi, User } from './users';
// import {
//   requestApi,
//   ServiceRequest,
//   PaginatedRequests,
//   RequestQuery,
// } from './requests';
// import { cache, generateCacheKey } from './utils';

// // Generic hook state
// interface UseDataState<T> {
//   data: T | null;
//   loading: boolean;
//   error: string | null;
//   refetch: () => Promise<void>;
// }

// // Generic hook for data fetching with caching
// function useData<T>(
//   fetchFn: () => Promise<T>,
//   cacheKey?: string,
//   cacheTtl?: number
// ): UseDataState<T> {
//   const [data, setData] = useState<T | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Check cache first
//       if (cacheKey) {
//         const cachedData = cache.get<T>(cacheKey);
//         if (cachedData) {
//           setData(cachedData);
//           setLoading(false);
//           return;
//         }
//       }

//       const result = await fetchFn();
//       setData(result);

//       // Cache the result
//       if (cacheKey) {
//         cache.set(cacheKey, result, cacheTtl);
//       }
//     } catch (err) {
//       let message = 'An error occurred';
//       if (err instanceof Error) {
//         message = err.message;
//       } else if (typeof err === 'string') {
//         message = err;
//       } else if (err && typeof err === 'object' && 'message' in err) {
//         message = (err as any).message;
//       }
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchFn, cacheKey, cacheTtl]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return { data, loading, error, refetch: fetchData };
// }

// // Service hooks
// export function useServices(query?: ServiceQueryData) {
//   const cacheKey = generateCacheKey('/services', query);
//   return useData<PaginatedServices>(
//     () => serviceApi.getServices(query),
//     cacheKey
//   );
// }

// export function useService(id: string) {
//   const cacheKey = generateCacheKey(`/services/${id}`);
//   return useData<Service>(() => serviceApi.getService(id), cacheKey);
// }

// export function useServiceCategories() {
//   const cacheKey = '/services/categories';
//   return useData(() => serviceApi.getCategories(), cacheKey, 10 * 60 * 1000); // 10 minutes
// }

// export function useUserServices(userId: string, query?: ServiceQueryData) {
//   const cacheKey = generateCacheKey(`/users/${userId}/services`, query);
//   return useData<PaginatedServices>(
//     () => serviceApi.getUserServices(userId, query),
//     cacheKey
//   );
// }

// // User hooks
// export function useProfile() {
//   const cacheKey = '/auth/profile';
//   return useData<User>(() => userApi.getProfile(), cacheKey);
// }

// export function useUser(id: string) {
//   const cacheKey = generateCacheKey(`/users/${id}`);
//   return useData<User>(() => userApi.getUser(id), cacheKey);
// }

// // Request hooks
// export function useRequests(query?: RequestQuery) {
//   const cacheKey = generateCacheKey(
//     '/requests',
//     query as Record<string, unknown>
//   );
//   return useData<PaginatedRequests>(
//     () => requestApi.getRequests(query),
//     cacheKey
//   );
// }

// export function useRequest(id: string) {
//   const cacheKey = generateCacheKey(`/requests/${id}`);
//   return useData<ServiceRequest>(() => requestApi.getRequest(id), cacheKey);
// }

// export function useUserRequests(userId: string, query?: RequestQuery) {
//   const cacheKey = generateCacheKey(
//     `/users/${userId}/requests`,
//     query as Record<string, unknown>
//   );
//   return useData<PaginatedRequests>(
//     () => requestApi.getUserRequests(userId, query),
//     cacheKey
//   );
// }

// // Mutation hooks
// export function useCreateService() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const createService = useCallback(
//     async (data: Parameters<typeof serviceApi.createService>[0]) => {
//       try {
//         setLoading(true);
//         setError(null);
//         const result = await serviceApi.createService(data);
//         // Clear relevant caches
//         cache.clear();
//         return result;
//       } catch (err) {
//         const message =
//           err instanceof Error ? err.message : 'Failed to create service';
//         setError(message);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   return { createService, loading, error };
// }

// export function useUpdateService() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const updateService = useCallback(
//     async (
//       id: string,
//       data: Parameters<typeof serviceApi.updateService>[1]
//     ) => {
//       try {
//         setLoading(true);
//         setError(null);
//         const result = await serviceApi.updateService(id, data);
//         // Clear relevant caches
//         cache.delete(`/services/${id}`);
//         cache.clear(); // Clear all for now, can be more specific
//         return result;
//       } catch (err) {
//         const message =
//           err instanceof Error ? err.message : 'Failed to update service';
//         setError(message);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   return { updateService, loading, error };
// }

// export function useDeleteService() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const deleteService = useCallback(async (id: string) => {
//     try {
//       setLoading(true);
//       setError(null);
//       await serviceApi.deleteService(id);
//       // Clear relevant caches
//       cache.delete(`/services/${id}`);
//       cache.clear(); // Clear all for now, can be more specific
//     } catch (err) {
//       const message =
//         err instanceof Error ? err.message : 'Failed to delete service';
//       setError(message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return { deleteService, loading, error };
// }

// export function useCreateRequest() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const createRequest = useCallback(
//     async (data: Parameters<typeof requestApi.createRequest>[0]) => {
//       try {
//         setLoading(true);
//         setError(null);
//         const result = await requestApi.createRequest(data);
//         // Clear relevant caches
//         cache.clear();
//         return result;
//       } catch (err) {
//         const message =
//           err instanceof Error ? err.message : 'Failed to create request';
//         setError(message);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   return { createRequest, loading, error };
// }

// export function useAuth() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const login = useCallback(
//     async (data: Parameters<typeof userApi.login>[0]) => {
//       try {
//         setLoading(true);
//         setError(null);
//         const result = await userApi.login(data);
//         // Clear caches on login
//         cache.clear();
//         return result;
//       } catch (err) {
//         const message = err instanceof Error ? err.message : 'Failed to login';
//         setError(message);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const register = useCallback(
//     async (data: Parameters<typeof userApi.register>[0]) => {
//       try {
//         setLoading(true);
//         setError(null);
//         const result = await userApi.register(data);
//         // Clear caches on register
//         cache.clear();
//         return result;
//       } catch (err) {
//         const message =
//           err instanceof Error ? err.message : 'Failed to register';
//         setError(message);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const logout = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       await userApi.logout();
//       // Clear all caches on logout
//       cache.clear();
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Failed to logout';
//       setError(message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return { login, register, logout, loading, error };
// }

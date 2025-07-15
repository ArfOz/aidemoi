// Re-export auth context and types
export * from './contexts/AuthContext';

// Auth utility functions (client-side only)
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const tokens = window.localStorage.getItem('auth_tokens');
  return tokens ? JSON.parse(tokens).accessToken : null;
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = { admin: 3, repairman: 2, customer: 1 };
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  return userLevel >= requiredLevel;
}

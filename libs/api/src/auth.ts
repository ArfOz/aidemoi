// Shared auth types and helpers (client-safe)

// Token payload shared between backend and frontend types
export interface TokenPayload {
  userId: string | number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Helper to parse Bearer token safely from an Authorization header
export function parseBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

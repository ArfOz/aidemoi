import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  exp?: number;
  [key: string]: any;
};

const isBrowser = typeof window !== 'undefined';

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const now = Date.now() / 1000;
    if (!decoded || typeof decoded.exp !== 'number') return true;
    return decoded.exp < now;
  } catch {
    return true;
  }
}

export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  if (!isBrowser) return;
  localStorage.setItem('token', token);
  // notify other tabs
  try {
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'token', newValue: token })
    );
  } catch {
    /* ignore */
  }
}

export function removeToken() {
  if (!isBrowser) return;
  localStorage.removeItem('token');
  try {
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'token', newValue: null as any })
    );
  } catch {
    /* ignore */
  }
}

export function logout(redirect = '/login') {
  removeToken();
  if (isBrowser) {
    // client-side redirect
    window.location.href = redirect;
  } else {
    // server-side: nothing to do here, callers should handle redirect
  }
}

export function checkTokenAndLogout(token?: string | null): boolean {
  if (isTokenExpired(token)) {
    logout();
    return true;
  }
  return false;
}

// Extract token from incoming request (SSR). Looks for cookie named "token".
export function getTokenFromRequest(
  req?: { headers?: { cookie?: string } } | undefined
): string | null {
  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const c of cookies) {
    const [k, ...rest] = c.split('=');
    if (k === 'token') return decodeURIComponent(rest.join('='));
  }
  return null;
}

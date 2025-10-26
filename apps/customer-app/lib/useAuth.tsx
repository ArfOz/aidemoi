import { useEffect, useState } from 'react';
import { getToken, isTokenExpired, logout } from './tokenService';

export function useAuth(redirectIfInvalid = true) {
  const [token, setToken] = useState<string | null>(() => getToken());

  useEffect(() => {
    const sync = () => setToken(getToken());

    // initial check
    const t = getToken();
    setToken(t);
    if (redirectIfInvalid && isTokenExpired(t)) {
      logout();
      return;
    }

    // periodic expiration check (every 5 seconds)
    const intervalMs = 5000;
    const intervalId = window.setInterval(() => {
      const current = getToken();
      // update local state if token changed
      if (current !== token) {
        setToken(current);
      }
      // if token missing or expired, logout
      if (!current || isTokenExpired(current)) {
        logout();
        setToken(null);
      }
    }, intervalMs);

    // listen to storage changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') sync();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(intervalId);
    };
  }, [redirectIfInvalid, token]);

  return {
    token,
    isAuthenticated: !!token && !isTokenExpired(token),
  };
}

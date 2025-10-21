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

    // listen to storage changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [redirectIfInvalid]);

  return {
    token,
    isAuthenticated: !!token && !isTokenExpired(token),
  };
}

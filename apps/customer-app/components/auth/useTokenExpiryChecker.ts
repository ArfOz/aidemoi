import { useEffect, useRef } from 'react';

interface TokenExpiryCheckerProps {
  getToken: () => string | null;
  onExpire: () => void;
  onWarn?: (secondsLeft: number) => void;
  checkIntervalMs?: number; // varsayılan: 5 dakika
}

/**
 * Basit JWT decode fonksiyonu — sadece payload döner
 */
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Her 5 dakikada bir token süresini kontrol eder.
 * Token süresi dolmuşsa onExpire çağrılır.
 */
export default function useTokenExpiryChecker({
  getToken,
  onExpire,
  onWarn,
  checkIntervalMs = 300000, // 5 dakika
}: TokenExpiryCheckerProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const checkNow = () => {
      const token = getToken();
      if (!token) return;

      const payload = decodeJwt(token);
      if (!payload?.exp) return;

      const nowSec = Math.floor(Date.now() / 1000);
      const expSec = payload.exp as number;
      const secondsLeft = expSec - nowSec;

      if (onWarn && secondsLeft <= 60 && secondsLeft > 0) {
        onWarn(secondsLeft);
      }

      if (secondsLeft <= 0) {
        onExpire();
        bcRef.current?.postMessage({ type: 'TOKEN_EXPIRED' });
      }
    };

    // Interval başlat
    intervalIdRef.current = setInterval(checkNow, checkIntervalMs);
    checkNow(); // ilk kontrol hemen

    // Sekmeler arası senkronizasyon (BroadcastChannel)
    try {
      bcRef.current = new BroadcastChannel('token-channel');
      bcRef.current.onmessage = (ev) => {
        if (ev.data?.type === 'TOKEN_EXPIRED') {
          onExpire();
        }
      };
    } catch {
      // desteklenmiyorsa boşver
    }

    // Odak veya görünürlük değişince hemen kontrol
    const onVisibilityOrFocus = () => checkNow();
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      bcRef.current?.close();
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
    };
  }, [getToken, onExpire, onWarn, checkIntervalMs]);
}

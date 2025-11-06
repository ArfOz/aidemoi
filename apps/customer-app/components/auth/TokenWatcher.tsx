'use client';

import { useRouter } from 'next/navigation';
import useTokenExpiryChecker from './useTokenExpiryChecker';

export default function TokenWatcher() {
  const router = useRouter();

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  };

  const onExpire = () => {
    console.log('Token expired. Redirecting to login...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const onWarn = (secondsLeft: number) => {
    console.log(`⚠️ Token expires in ${secondsLeft} seconds`);
  };

  useTokenExpiryChecker({
    getToken,
    onExpire,
    onWarn,
    checkIntervalMs: 300000, // 5 dakika
  });

  return null;
}

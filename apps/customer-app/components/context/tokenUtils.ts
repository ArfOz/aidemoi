import jwtDecode from 'jwt-decode';
import { TokenType } from '@api';

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return false;
    // exp is in seconds, Date.now() in ms
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function getTokenExpiration(token: string): number | null {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

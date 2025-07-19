import jwt, { SignOptions, Secret } from 'jsonwebtoken';

interface TokenPayload {
  userId: number;
  email: string;
  username: string;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export class JwtService {
  private static readonly JWT_SECRET: Secret =
    process.env.JWT_SECRET || 'your-super-secret-key';
  private static readonly JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
    '24h') as SignOptions['expiresIn'];
  private static readonly REFRESH_TOKEN_EXPIRES_IN = (process.env
    .REFRESH_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  /**
   * Generate access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'aide-moi-backend',
      audience: 'aide-moi-frontend'
    };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'aide-moi-backend',
      audience: 'aide-moi-frontend'
    };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Verify and decode token
   */
  static verifyToken(token: string): DecodedToken | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as DecodedToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    return expiration ? expiration < new Date() : true;
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
}

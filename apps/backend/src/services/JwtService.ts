import { sign, verify, decode, SignOptions, Secret } from 'jsonwebtoken';

interface BaseTokenPayload {
  type: 'user' | 'company';
}

export interface UserTokenPayload extends BaseTokenPayload {
  type: 'user';
  userId: number;
  email?: string;
  username?: string;
}

export interface CompanyTokenPayload extends BaseTokenPayload {
  type: 'company';
  companyId: number;
  email?: string;
  name?: string;
}

type TokenPayload = UserTokenPayload | CompanyTokenPayload;

type DecodedToken = TokenPayload & {
  iat: number;
  exp: number;
};

export class JwtService {
  private static readonly JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-super-secret-key';
  private static readonly JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
    '24h') as SignOptions['expiresIn'];
  private static readonly REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN ||
    '7d') as SignOptions['expiresIn'];

  /**
   * Generate access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'aide-moi-backend',
      audience: 'aide-moi-frontend',
    };
    return sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'aide-moi-backend',
      audience: 'aide-moi-frontend',
    };
    return sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Verify and decode token
   */
  static verifyToken(token: string): DecodedToken | null {
    try {
      const decoded = verify(token, this.JWT_SECRET) as DecodedToken;
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
      const decoded = decode(token) as DecodedToken;
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
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /** Convenience: generate tokens for a user */
  static generateUserTokenPair(user: { userId: number; email?: string; username?: string }) {
    const payload: UserTokenPayload = {
      type: 'user',
      userId: user.userId,
      email: user.email,
      username: user.username,
    };
    return this.generateTokenPair(payload);
  }

  /** Convenience: generate tokens for a company */
  static generateCompanyTokenPair(company: { companyId: number; email?: string; name?: string }) {
    const payload: CompanyTokenPayload = {
      type: 'company',
      companyId: company.companyId,
      email: company.email,
      name: company.name,
    };
    return this.generateTokenPair(payload);
  }
}

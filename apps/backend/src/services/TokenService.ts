import { DataSource, Repository, LessThan, MoreThan, IsNull } from 'typeorm';
import { Token } from '../entities/Token';

export class TokenService {
  private tokenRepository: Repository<Token>;

  constructor(dataSource: DataSource) {
    this.tokenRepository = dataSource.getRepository(Token);
  }

  // Create and persist a token
  async createToken(data: {
    userId: number;
    token: string;
    expiresAt: Date | null;
    refreshToken: string;
  }): Promise<Token> {
    const token = this.tokenRepository.create({
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      refreshToken: data.refreshToken,
    });
    return await this.tokenRepository.save(token);
  }

  // Get token by exact value
  async getTokenByValue(token: string): Promise<Token | null> {
    return await this.tokenRepository.findOne({ where: { token } });
  }

  // Get token by value that is still valid (not expired)
  async getValidTokenByValue(
    token: string,
    now: Date = new Date()
  ): Promise<Token | null> {
    return await this.tokenRepository.findOne({
      where: [
        // expiresAt is null (no expiry)
        { token, expiresAt: IsNull() },
        // or expiresAt is in the future
        { token, expiresAt: MoreThan(now) },
      ],
    });
  }

  // Delete a specific token by value and return it
  async deleteToken(value: string): Promise<Token | null> {
    const token = await this.getTokenByValue(value);
    if (!token) return null;
    await this.tokenRepository.remove(token);
    return token;
  }

  // Delete all tokens for a user (useful for logout-all)
  async deleteTokensByUser(userId: number): Promise<number> {
    const result = await this.tokenRepository.delete({ userId });
    return result.affected ?? 0;
  }

  // Remove expired tokens
  async deleteExpiredTokens(now: Date = new Date()): Promise<number> {
    const result = await this.tokenRepository.delete({
      expiresAt: LessThan(now),
    });
    return result.affected ?? 0;
  }

  // List tokens by user
  async getTokensByUser(userId: number): Promise<Token[]> {
    return await this.tokenRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}

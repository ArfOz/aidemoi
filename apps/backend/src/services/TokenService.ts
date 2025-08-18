import { DataSource, Repository, LessThan, MoreThan, IsNull } from 'typeorm';
import { Token } from '../entities/Token';

export class TokenService {
  private tokenRepository: Repository<Token>;

  constructor(dataSource: DataSource) {
    if (!dataSource.isInitialized) {
      throw new Error(
        'DataSource must be initialized before using TokenService'
      );
    }
    this.tokenRepository = dataSource.getRepository(Token);
  }

  // Upsert by userId (one row per user)
  async createToken(data: {
    userId: number;
    token: string;
    refreshToken: string;
    expiresAtToken: Date | null;
    expiresAtRefresh: Date | null;
  }): Promise<Token> {
    await this.tokenRepository.upsert(
      {
        userId: data.userId,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAtToken: data.expiresAtToken,
        expiresAtRefresh: data.expiresAtRefresh,
      },
      ['userId']
    );
    const token = await this.tokenRepository.findOne({
      where: { userId: data.userId },
    });
    if (!token) {
      throw new Error('Token not found after upsert');
    }
    return token;
  }

  // Search by either access or refresh token
  async getTokenByValue(value: string): Promise<Token | null> {
    return await this.tokenRepository.findOne({
      where: [{ token: value }, { refreshToken: value }],
    });
  }

  // Validate access OR refresh token against its proper expiry
  async getValidTokenByValue(
    value: string,
    now: Date = new Date()
  ): Promise<Token | null> {
    return await this.tokenRepository.findOne({
      where: [
        { token: value, expiresAtToken: IsNull() },
        { token: value, expiresAtToken: MoreThan(now) },
        { refreshToken: value, expiresAtRefresh: IsNull() },
        { refreshToken: value, expiresAtRefresh: MoreThan(now) },
      ],
    });
  }

  async deleteToken(value: string): Promise<Token | null> {
    const token = await this.getTokenByValue(value);
    if (!token) return null;
    await this.tokenRepository.remove(token);
    return token;
  }

  async deleteTokensByUser(userId: number): Promise<number> {
    const result = await this.tokenRepository.delete({ userId });
    return result.affected ?? 0;
  }

  async deleteExpiredTokens(now: Date = new Date()): Promise<number> {
    const result = await this.tokenRepository.delete({
      expiresAtToken: LessThan(now),
    });
    return result.affected ?? 0;
  }

  async getTokensByUser(userId: number): Promise<Token[]> {
    return await this.tokenRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}

import { PrismaClient } from '@prisma/client';

export class TokenDBService {
  constructor(private prisma: PrismaClient) {} // Will be injected by Fastify plugin

  // Upsert by userId (one row per user)
  async createToken(data: {
    userId: number;
    token: string;
    refreshToken: string;
    expiresAtToken: Date | null;
    expiresAtRefresh: Date | null;
  }) {
    // First try to find existing token for this user
    const existingToken = await this.prisma.token.findFirst({
      where: { userId: data.userId },
    });

    if (existingToken) {
      // Update existing token
      return this.prisma.token.update({
        where: { id: existingToken.id },
        data: {
          accessToken: data.token,
          refreshToken: data.refreshToken,
          expiresAtAccessToken: data.expiresAtToken || undefined,
          expiresAtRefreshToken: data.expiresAtRefresh || undefined,
        },
      });
    } else {
      // Create new token
      return this.prisma.token.create({
        data: {
          userId: data.userId,
          accessToken: data.token,
          refreshToken: data.refreshToken,
          expiresAtAccessToken: data.expiresAtToken || new Date(),
          expiresAtRefreshToken: data.expiresAtRefresh || new Date(),
        },
      });
    }
  }

  // Search by either access or refresh token
  async getTokenByValue(value: string) {
    return this.prisma.token.findFirst({
      where: {
        OR: [{ accessToken: value }, { refreshToken: value }],
      },
    });
  }

  // Validate only the refresh token against its expiry
  async getValidTokenByValue(value: string, now: Date = new Date()) {
    return this.prisma.token.findFirst({
      where: {
        refreshToken: value,
        expiresAtRefreshToken: { gt: now },
      },
    });
  }

  async deleteToken(value: string) {
    const token = await this.getTokenByValue(value);
    if (!token) return null;

    await this.prisma.token.delete({
      where: { id: token.id },
    });
    return token;
  }

  async deleteTokensByUser(userId: number): Promise<number> {
    const result = await this.prisma.token.deleteMany({
      where: { userId },
    });
    return result.count;
  }

  async deleteExpiredTokens(now: Date = new Date()): Promise<number> {
    const result = await this.prisma.token.deleteMany({
      where: {
        expiresAtAccessToken: { lt: now },
      },
    });
    return result.count;
  }

  async getTokensByUser(userId: number) {
    return this.prisma.token.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

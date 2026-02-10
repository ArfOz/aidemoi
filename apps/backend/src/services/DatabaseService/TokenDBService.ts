import { PrismaClient } from '@prisma/client';

export class TokenDBService {
  constructor(private prisma: PrismaClient) {} // Will be injected by Fastify plugin

  // Upsert by userId or companyId (one row per principal)
  async createToken(data: {
    userId?: number;
    companyId?: number;
    token: string;
    refreshToken: string;
    expiresAtToken: Date | null;
    expiresAtRefresh: Date | null;
  }) {
    if (data.companyId) {
      const existing = await this.prisma.companyToken.findFirst({
        where: { companyId: data.companyId },
      });

      if (existing) {
        return this.prisma.companyToken.update({
          where: { id: existing.id },
          data: {
            accessToken: data.token,
            refreshToken: data.refreshToken,
            expiresAtAccessToken: data.expiresAtToken || undefined,
            expiresAtRefreshToken: data.expiresAtRefresh || undefined,
          },
        });
      }

      return this.prisma.companyToken.create({
        data: {
          companyId: data.companyId,
          accessToken: data.token,
          refreshToken: data.refreshToken,
          expiresAtAccessToken: data.expiresAtToken || new Date(),
          expiresAtRefreshToken: data.expiresAtRefresh || new Date(),
        },
      });
    }

    // default to user token
    const userId = data.userId as number;
    const existingUserToken = await this.prisma.userToken.findFirst({
      where: { userId },
    });

    if (existingUserToken) {
      return this.prisma.userToken.update({
        where: { id: existingUserToken.id },
        data: {
          accessToken: data.token,
          refreshToken: data.refreshToken,
          expiresAtAccessToken: data.expiresAtToken || undefined,
          expiresAtRefreshToken: data.expiresAtRefresh || undefined,
        },
      });
    }

    return this.prisma.userToken.create({
      data: {
        userId,
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresAtAccessToken: data.expiresAtToken || new Date(),
        expiresAtRefreshToken: data.expiresAtRefresh || new Date(),
      },
    });
  }

  // Search by either access or refresh token across both tables
  async getTokenByValue(value: string) {
    const user = await this.prisma.userToken.findFirst({
      where: { OR: [{ accessToken: value }, { refreshToken: value }] },
    });
    if (user) return user;

    const company = await this.prisma.companyToken.findFirst({
      where: { OR: [{ accessToken: value }, { refreshToken: value }] },
    });
    return company;
  }

  // Validate only the refresh token against its expiry
  async getValidTokenByValue(value: string, now: Date = new Date()) {
    const user = await this.prisma.userToken.findFirst({
      where: { refreshToken: value, expiresAtRefreshToken: { gt: now } },
    });
    if (user) return user;

    const company = await this.prisma.companyToken.findFirst({
      where: { refreshToken: value, expiresAtRefreshToken: { gt: now } },
    });
    return company;
  }

  async deleteToken(value: string) {
    const token = await this.getTokenByValue(value);
    if (!token) return null;

    // token may be a userToken or companyToken — both have `id`
    if ('userId' in token) {
      await this.prisma.userToken.delete({ where: { id: token.id } });
    } else if ('companyId' in token) {
      await this.prisma.companyToken.delete({ where: { id: token.id } });
    }
    return token;
  }

  async deleteTokensByUser(userId: number): Promise<number> {
    const result = await this.prisma.userToken.deleteMany({ where: { userId } });
    return result.count;
  }

  async deleteExpiredTokens(now: Date = new Date()): Promise<number> {
    const userRes = await this.prisma.userToken.deleteMany({
      where: { expiresAtAccessToken: { lt: now } },
    });
    const compRes = await this.prisma.companyToken.deleteMany({
      where: { expiresAtAccessToken: { lt: now } },
    });
    return userRes.count + compRes.count;
  }

  async getTokensByUser(userId: number) {
    return this.prisma.userToken.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}

import { PrismaClient } from '@prisma/client';

export class CompanyTokenDBService {
  constructor(private prisma: PrismaClient) {} // Will be injected by Fastify plugin

  // Upsert a company token (one row per company)
  async createToken(data: {
    companyId: number;
    token: string;
    refreshToken: string;
    expiresAtToken: Date | null;
    expiresAtRefresh: Date | null;
  }) {
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

  // Find token row by access or refresh token
  async getTokenByValue(value: string) {
    return this.prisma.companyToken.findFirst({
      where: { OR: [{ accessToken: value }, { refreshToken: value }] },
    });
  }

  // Validate refresh token expiry
  async getValidTokenByValue(value: string, now: Date = new Date()) {
    return this.prisma.companyToken.findFirst({
      where: { refreshToken: value, expiresAtRefreshToken: { gt: now } },
    });
  }

  // Delete a token row by its token value
  async deleteToken(value: string) {
    const token = await this.getTokenByValue(value);
    if (!token) return null;
    await this.prisma.companyToken.delete({ where: { id: token.id } });
    return token;
  }

  // Delete all tokens for a company
  async deleteTokensByCompany(companyId: number): Promise<number> {
    const result = await this.prisma.companyToken.deleteMany({ where: { companyId } });
    return result.count;
  }

  // Delete expired access tokens
  async deleteExpiredTokens(now: Date = new Date()): Promise<number> {
    const res = await this.prisma.companyToken.deleteMany({
      where: { expiresAtAccessToken: { lt: now } },
    });
    return res.count;
  }

  // List tokens for a company
  async getTokensByCompany(companyId: number) {
    return this.prisma.companyToken.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

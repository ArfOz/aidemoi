import { Prisma, PrismaClient } from '@prisma/client';

export type CategoryI18nWithRelations = Prisma.CategoryI18nGetPayload<{
  include: { category: true };
}>;

export class CategoryI18nDBService {
  constructor(private prisma: PrismaClient) {} // Will be injected by Fastify plugin

  async create(data: {
    categoryId: string;
    locale: string;
    name: string;
    description?: string | null;
  }) {
    return this.prisma.categoryI18n.create({
      data: {
        categoryId: data.categoryId,
        locale: data.locale,
        name: data.name,
        description: data.description ?? null,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.categoryI18n.findUnique({
      where: { id },
    });
  }

  async findByLocaleAndCategory(categoryId: string, locale: string) {
    return this.prisma.categoryI18n.findFirst({
      where: { categoryId, locale },
    });
  }

  async findByCategoryId(categoryId: string) {
    return this.prisma.categoryI18n.findMany({
      where: { categoryId },
      orderBy: { locale: 'asc' },
    });
  }

  async findByLocale(locale: string) {
    return this.prisma.categoryI18n.findMany({
      where: { locale },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(options?: {
    where?: Prisma.CategoryI18nWhereInput;
    orderBy?: Prisma.CategoryI18nOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    return this.prisma.categoryI18n.findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
    });
  }

  async update(id: number, data: { name?: string; description?: string | null }) {
    return this.prisma.categoryI18n.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async updateByLocaleAndCategory(
    categoryId: string,
    locale: string,
    data: { name?: string; description?: string | null },
  ) {
    const categoryI18n = await this.findByLocaleAndCategory(categoryId, locale);
    if (!categoryI18n) {
      return null;
    }

    return this.update(categoryI18n.id, data);
  }

  async upsert(data: {
    categoryId: string;
    locale: string;
    name: string;
    description?: string | null;
  }) {
    const existing = await this.findByLocaleAndCategory(data.categoryId, data.locale);

    if (existing) {
      const updated = await this.update(existing.id, {
        name: data.name,
        description: data.description,
      });
      return {
        entity: updated,
        created: false,
      };
    } else {
      const created = await this.create(data);
      return {
        entity: created,
        created: true,
      };
    }
  }

  async delete(id: number) {
    const result = await this.prisma.categoryI18n.delete({
      where: { id },
    });
    return !!result;
  }

  async deleteByLocaleAndCategory(categoryId: string, locale: string) {
    const item = await this.findByLocaleAndCategory(categoryId, locale);
    if (!item) return false;

    await this.prisma.categoryI18n.delete({
      where: { id: item.id },
    });
    return true;
  }

  async deleteByCategoryId(categoryId: string) {
    const result = await this.prisma.categoryI18n.deleteMany({
      where: { categoryId },
    });
    return result.count;
  }

  async count(categoryId?: string) {
    return this.prisma.categoryI18n.count({
      where: categoryId ? { categoryId } : undefined,
    });
  }

  async getAvailableLocales(categoryId?: string) {
    const records = await this.prisma.categoryI18n.groupBy({
      by: ['locale'],
      where: categoryId ? { categoryId } : undefined,
      orderBy: { locale: 'asc' },
    });

    return records.map((r) => r.locale);
  }
}

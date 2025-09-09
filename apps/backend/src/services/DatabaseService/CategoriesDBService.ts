import { Prisma, PrismaClient } from '@prisma/client';

export type CategoryWithI18n = Prisma.CategoryGetPayload<{
  include: { i18n: true };
}>;

export class CategoriesDBService {
  constructor(private prisma: PrismaClient) {}

  async findAll({
    where,
    orderBy,
    languages,
  }: {
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput[];
    languages?: string[];
  } = {}): Promise<CategoryWithI18n[]> {
    return await this.prisma.category.findMany({
      where,
      include: {
        i18n:
          languages && languages.length > 0
            ? {
                where: {
                  locale: { in: languages },
                },
              }
            : true,
      },
      orderBy,
    });
  }

  async findById({
    where,
    languages,
  }: {
    where: Prisma.CategoryWhereUniqueInput;
    languages?: string[];
  }): Promise<CategoryWithI18n | null> {
    return await this.prisma.category.findUnique({
      where,
      include: {
        i18n:
          languages && languages.length > 0
            ? {
                where: {
                  locale: { in: languages },
                },
              }
            : true,
        subcategories: {
          include: {
            i18n:
              languages && languages.length > 0
                ? {
                    where: {
                      locale: { in: languages },
                    },
                  }
                : true,
          },
        },
      },
    });
  }

  async create(input: Prisma.CategoryCreateInput): Promise<CategoryWithI18n> {
    const created = await this.prisma.category.create({
      data: input,
      include: {
        i18n: true,
        subcategories: {
          include: {
            i18n: true,
          },
        },
      },
    });
    return created;
  }

  async update(
    id: string,
    input: Prisma.CategoryUpdateInput
  ): Promise<CategoryWithI18n> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: input,
      include: {
        i18n: true,
        subcategories: {
          include: {
            i18n: true,
          },
        },
      },
    });
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.prisma.category.deleteMany({ where: { id } });
    return res.count > 0;
  }

  async count(): Promise<number> {
    return this.prisma.category.count();
  }
}

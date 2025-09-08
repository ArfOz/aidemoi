import { Prisma, PrismaClient } from '@prisma/client';

export type CategoryWithI18n = Prisma.CategoryGetPayload<{
  include: { i18n: true; subcategories: true };
}>;

export class CategoriesDBService {
  constructor(private prisma: PrismaClient) {}

  async findAll({
    where,
    orderBy,
    include,
  }: {
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput[];
    include?: Prisma.CategoryInclude;
  } = {}): Promise<CategoryWithI18n[]> {
    return this.prisma.category.findMany({
      include: { i18n: true, subcategories: true },
      orderBy: orderBy,
    });
  }

  async findById({
    where,
    include,
  }: {
    where: Prisma.CategoryWhereUniqueInput;
    include?: Prisma.CategoryInclude;
  }): Promise<CategoryWithI18n | null> {
    return this.prisma.category.findUnique({
      where,
      include: include ?? { i18n: true, subcategories: true },
    });
  }

  async create(input: Prisma.CategoryCreateInput): Promise<CategoryWithI18n> {
    const created = await this.prisma.category.create({
      data: input,
      include: { i18n: true, subcategories: true },
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
      include: { i18n: true, subcategories: true },
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

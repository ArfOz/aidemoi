import { Prisma, PrismaClient } from '@prisma/client';

export type SubcategoryI18nWithRelations = Prisma.SubcategoryI18nGetPayload<{
  include: { subcategory: true };
}>;

export interface UpdateSubcategoryI18nInput {
  name?: string;
  description?: string | null;
}

/**
 * CRUD service for sub-category i18n records using Prisma.
 */
export class SubCategoriesI18nDBService {
  constructor(private prisma: PrismaClient) {} // Will be injected by Fastify plugin

  // create
  async create(input: {
    subcategoryId: number;
    locale: string;
    name: string;
    description?: string | null;
  }) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id: input.subcategoryId },
    });
    if (!subcategory)
      throw new Error(`Subcategory not found: ${input.subcategoryId}`);

    return this.prisma.subcategoryI18n.create({
      data: {
        subcategoryId: input.subcategoryId,
        locale: input.locale,
        name: input.name,
        description: input.description ?? null,
      },
    });
  }

  // find by id
  async findById(id: number) {
    return this.prisma.subcategoryI18n.findUnique({ where: { id } });
  }

  // find by subcategory and locale
  async findBySubcategoryAndLocale(subcategoryId: number, locale: string) {
    return this.prisma.subcategoryI18n.findFirst({
      where: { subcategoryId, locale },
    });
  }

  // find all by subcategory
  async findAllBySubcategoryId(subcategoryId: number) {
    return this.prisma.subcategoryI18n.findMany({
      where: { subcategoryId },
      orderBy: { locale: 'asc' },
    });
  }

  // update
  async update(id: number, input: UpdateSubcategoryI18nInput) {
    try {
      return this.prisma.subcategoryI18n.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description ?? null,
        },
      });
    } catch {
      // update throws if not found
      return null;
    }
  }

  // upsert (find then update/create)
  async upsert(input: {
    subcategoryId: number;
    locale: string;
    name: string;
    description?: string | null;
  }) {
    const existing = await this.prisma.subcategoryI18n.findFirst({
      where: { subcategoryId: input.subcategoryId, locale: input.locale },
    });

    if (existing) {
      const updated = await this.prisma.subcategoryI18n.update({
        where: { id: existing.id },
        data: { name: input.name, description: input.description ?? null },
      });
      return {
        entity: updated,
        created: false,
      };
    } else {
      const created = await this.create(input);
      return { entity: created, created: true };
    }
  }

  // delete
  async delete(id: number): Promise<boolean> {
    const res = await this.prisma.subcategoryI18n.deleteMany({ where: { id } });
    return (res.count ?? 0) > 0;
  }

  // count
  async count(subcategoryId?: number): Promise<number> {
    return this.prisma.subcategoryI18n.count({
      where: subcategoryId ? { subcategoryId } : {},
    });
  }
}
//         subcategoryId: updated.subcategoryId,
//         locale: updated.locale,
//         name: updated.name,
//         description: updated.description ?? null,
//       };
//     } catch {
//       // update throws if not found
//       return null;
//     }
//   }

//   // upsert (find then update/create)
//   async upsert(
//     input: CreateSubcategoryI18nInput
//   ): Promise<{ entity: SubcategoryI18nDto; created: boolean }> {
//     const existing = await prisma.subcategoryI18n.findFirst({
//       where: { subcategoryId: input.subcategoryId, locale: input.locale },
//     });

//     if (existing) {
//       const updated = await prisma.subcategoryI18n.update({
//         where: { id: existing.id },
//         data: { name: input.name, description: input.description ?? null },
//       });
//       return {
//         entity: {
//           id: updated.id,
//           subcategoryId: updated.subcategoryId,
//           locale: updated.locale,
//           name: updated.name,
//           description: updated.description ?? null,
//         },
//         created: false,
//       };
//     } else {
//       const created = await this.create(input);
//       return { entity: created, created: true };
//     }
//   }

//   // delete
//   async delete(id: number): Promise<boolean> {
//     const res = await prisma.subcategoryI18n.deleteMany({ where: { id } });
//     return (res.count ?? 0) > 0;
//   }

//   // count
//   async count(subcategoryId?: number): Promise<number> {
//     return prisma.subcategoryI18n.count({
//       where: subcategoryId ? { subcategoryId } : {},
//     });
//   }
// }

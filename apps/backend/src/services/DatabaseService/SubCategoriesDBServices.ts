import { Prisma, PrismaClient } from '@prisma/client';

export type SubcategoryWithI18n = Prisma.SubcategoryGetPayload<{
  include: { i18n: true };
}>;

export type SubcategoryId = string;

export interface SubcategoryI18nInput {
  locale: string;
  name: string;
  description?: string | null;
}

export interface CreateSubcategoryInput {
  categoryId: string;
  slug?: string;
  icon?: string | null;
  sortOrder?: number;
  i18n: SubcategoryI18nInput[];
}

export interface UpdateSubcategoryInput {
  icon?: string | null;
  sortOrder?: number;
  i18n?: SubcategoryI18nInput[];
}

export class SubCategoriesDBServices {
  constructor(private prisma: PrismaClient) {} // Will be injected by Fastify plugin

  async findAll(
    opts: {
      where?: Prisma.SubcategoryWhereInput;
      order?: Prisma.SubcategoryOrderByWithRelationInput;
    } = {}
  ): Promise<SubcategoryWithI18n[]> {
    return this.prisma.subcategory.findMany({
      where: opts.where,
      include: { i18n: true },
      orderBy: opts.order ?? [{ sortOrder: 'asc' }, { slug: 'asc' }],
    });
  }

  async findBySlugAndCategory(
    categoryId: string,
    slug: SubcategoryId
  ): Promise<SubcategoryWithI18n | null> {
    return this.prisma.subcategory.findFirst({
      where: { categoryId, slug },
      include: { i18n: true },
    });
  }

  async create(
    input: CreateSubcategoryInput
  ): Promise<{ categoryId: string; slug: SubcategoryId; created: true }> {
    if (!input.i18n || input.i18n.length === 0) {
      throw new Error('At least one i18n entry is required');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new Error(`Category not found: ${input.categoryId}`);
    }

    const preferred =
      input.i18n.find((e) => e.locale.toLowerCase() === 'en') ?? input.i18n[0];
    const baseSlug = (input.slug ?? preferred.name)
      .toString()
      .replace(/\s+/g, '-')
      .toLowerCase();

    // ensure unique slug within category
    let slug = baseSlug;
    let suffix = 2;
    while (
      await this.prisma.subcategory.findFirst({
        where: { categoryId: input.categoryId, slug },
      })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const created = await this.prisma.subcategory.create({
      data: {
        categoryId: input.categoryId,
        slug,
        icon: input.icon ?? null,
        sortOrder: input.sortOrder ?? 0,
        name: preferred.name,
        i18n: {
          create: input.i18n.map((it) => ({
            locale: it.locale.toLowerCase().trim(),
            name: it.name,
            description: it.description ?? null,
          })),
        },
      },
    });

    return {
      categoryId: created.categoryId,
      slug: created.slug,
      created: true,
    };
  }

  async update(
    categoryId: string,
    slug: SubcategoryId,
    input: UpdateSubcategoryInput
  ): Promise<{
    categoryId: string;
    slug: SubcategoryId;
    updated: true;
    updatedLocales: string[];
  }> {
    const existing = await this.prisma.subcategory.findFirst({
      where: { categoryId, slug },
    });
    if (!existing)
      throw new Error(`Subcategory not found: ${categoryId}/${slug}`);

    await this.prisma.subcategory.update({
      where: { id: existing.id },
      data: {
        icon: input.icon ?? existing.icon,
        sortOrder:
          typeof input.sortOrder === 'number'
            ? input.sortOrder
            : existing.sortOrder,
      },
    });

    const updatedLocales: string[] = [];
    if (input.i18n && input.i18n.length > 0) {
      for (const entry of input.i18n) {
        const found = await this.prisma.subcategoryI18n.findFirst({
          where: { subcategoryId: existing.id, locale: entry.locale },
        });

        if (found) {
          await this.prisma.subcategoryI18n.update({
            where: { id: found.id },
            data: { name: entry.name, description: entry.description ?? null },
          });
        } else {
          await this.prisma.subcategoryI18n.create({
            data: {
              subcategoryId: existing.id,
              locale: entry.locale,
              name: entry.name,
              description: entry.description ?? null,
            },
          });
        }
        updatedLocales.push(entry.locale);
      }
    }

    return { categoryId, slug, updated: true, updatedLocales };
  }

  async delete(categoryId: string, slug: SubcategoryId): Promise<boolean> {
    const res = await this.prisma.subcategory.deleteMany({
      where: { categoryId, slug },
    });
    return res.count > 0;
  }

  async count(categoryId?: string): Promise<number> {
    return this.prisma.subcategory.count({
      where: categoryId ? { categoryId } : {},
    });
  }

  async findByCategoryId(categoryId: string): Promise<SubcategoryWithI18n[]> {
    return this.findAll({
      where: { categoryId },
      order: { sortOrder: 'asc', slug: 'asc' },
    });
  }
}
//       throw new Error('At least one i18n entry is required');
//     }

//     const category = await this.categoryRepo.findOne({
//       where: { id: input.categoryId },
//     });
//     if (!category) {
//       throw new Error(`Category not found: ${input.categoryId}`);
//     }

//     const preferred =
//       input.i18n.find((e) => e.locale.toLowerCase() === 'en') ?? input.i18n[0];
//     const baseSlug = input.slug || this.slugify(preferred.name);
//     const slug = await this.ensureUniqueSubcategorySlug(
//       input.categoryId,
//       baseSlug
//     );

//     let subcategory = this.subcategoryRepo.create({
//       categoryId: input.categoryId,
//       slug,
//       icon: input.icon ?? null,
//       sortOrder: input.sortOrder ?? 0,
//       category,
//     });
//     subcategory = await this.subcategoryRepo.save(subcategory);

//     for (const entry of input.i18n) {
//       const rec = this.subcategoryI18nRepo.create({
//         subcategory,
//         locale: entry.locale,
//         name: entry.name,
//         description: entry.description ?? null,
//       });
//       await this.subcategoryI18nRepo.save(rec);
//     }

//     return { categoryId: input.categoryId, slug, created: true } as const;
//   }

//   async update(
//     categoryId: string,
//     slug: SubcategoryId,
//     input: UpdateSubcategoryInput
//   ): Promise<{
//     categoryId: string;
//     slug: SubcategoryId;
//     updated: true;
//     updatedLocales: string[];
//   }> {
//     const subcategory = await this.subcategoryRepo.findOne({
//       where: { categoryId, slug },
//       relations: { category: true },
//     });
//     if (!subcategory) {
//       throw new Error(`Subcategory not found: ${categoryId}/${slug}`);
//     }

//     subcategory.icon = input.icon ?? subcategory.icon ?? null;
//     if (typeof input.sortOrder === 'number') {
//       subcategory.sortOrder = input.sortOrder;
//     }

//     const updatedLocales: string[] = [];
//     if (input.i18n && input.i18n.length > 0) {
//       // If i18n is being updated, also update the denormalized `name` field
//       const preferred =
//         input.i18n.find((e) => e.locale.toLowerCase() === 'en') ??
//         input.i18n[0];
//       if (preferred) {
//         (subcategory as any).name = preferred.name;
//       }

//       for (const entry of input.i18n) {
//         const existing = await this.subcategoryI18nRepo.findOne({
//           where: { subcategory: { id: subcategory.id }, locale: entry.locale },
//           relations: { subcategory: true },
//         });
//         if (existing) {
//           existing.name = entry.name;
//           existing.description = entry.description ?? null;
//           await this.subcategoryI18nRepo.save(existing);
//         } else {
//           const rec = this.subcategoryI18nRepo.create({
//             subcategory,
//             locale: entry.locale,
//             name: entry.name,
//             description: entry.description ?? null,
//           });
//           await this.subcategoryI18nRepo.save(rec);
//         }
//         updatedLocales.push(entry.locale);
//       }
//     }

//     await this.subcategoryRepo.save(subcategory);

//     return { categoryId, slug, updated: true, updatedLocales } as const;
//   }

//   async delete(categoryId: string, slug: SubcategoryId): Promise<boolean> {
//     const res = await this.subcategoryRepo.delete({ categoryId, slug });
//     return (res.affected ?? 0) > 0;
//   }

//   async count(categoryId?: string): Promise<number> {
//     if (categoryId) {
//       return this.subcategoryRepo.count({ where: { categoryId } });
//     }
//     return this.subcategoryRepo.count();
//   }

//   async findByCategoryId(categoryId: string): Promise<SubcategoryDto[]> {
//     return this.findAll({
//       where: { categoryId },
//       order: { sortOrder: 'ASC', slug: 'ASC' },
//     });
//   }
// }

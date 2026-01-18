import { Prisma, PrismaClient, Subcategory } from '@prisma/client';

export class SubCategoriesDBService {
  constructor(private prisma: PrismaClient) {} // Will be injected by Fastify plugin

  async findAll(
    opts: {
      where?: Prisma.SubcategoryWhereInput;
      order?: Prisma.SubcategoryOrderByWithRelationInput;
    } = {},
  ): Promise<Subcategory[]> {
    return await this.prisma.subcategory.findMany({
      where: opts.where,
      include: { i18n: true },
      orderBy: opts.order ?? [{ sortOrder: 'asc' }, { slug: 'asc' }],
    });
  }

  async findUnique({
    where,
  }: {
    where: Prisma.SubcategoryWhereUniqueInput;
  }): Promise<Subcategory | null> {
    return await this.prisma.subcategory.findUnique({
      where,
      include: { i18n: true },
    });
  }

  async create(input: {
    categoryId: string;
    i18n: { locale: string; name: string; description?: string }[];
    slug?: string;
    icon?: string;
    sortOrder?: number;
  }): Promise<Subcategory> {
    if (!input.i18n || input.i18n.length === 0) {
      throw new Error('At least one i18n entry is required');
    }

    // const category = await this.prisma.category.findUnique({
    //   where: { id: input.categoryId },
    // });
    // if (!category) {
    //   throw new Error(`Category not found: ${input.categoryId}`);
    // }

    const preferred = input.i18n.find((e) => e.locale.toLowerCase() === 'en') ?? input.i18n[0];
    const baseSlug = (input.slug ?? preferred.name).toString().replace(/\s+/g, '-').toLowerCase();

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

    return created;
  }

  async update(
    where: Prisma.SubcategoryWhereUniqueInput,
    input: Prisma.SubcategoryUpdateInput,
  ): Promise<Subcategory> {
    return await this.prisma.subcategory.update({
      where,
      data: input,
    });
  }

  async delete(where: Prisma.SubcategoryWhereUniqueInput): Promise<boolean> {
    const res = await this.prisma.subcategory.deleteMany({
      where,
    });
    return res.count > 0;
  }

  async count(categoryId?: string): Promise<number> {
    return this.prisma.subcategory.count({
      where: categoryId ? { categoryId } : {},
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

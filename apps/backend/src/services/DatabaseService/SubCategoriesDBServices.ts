import {
  DataSource,
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOneOptions,
} from 'typeorm';
import { Category } from '../../entities/Category';
import { Subcategory, SubcategoryI18n } from '../../entities/Subcategory';

export type SubcategoryId = string; // slug primary key (e.g., "long-distance")

export interface SubcategoryI18nInput {
  locale: string;
  name: string;
  description?: string | null;
}

// slug is optional; the service will generate one from i18n if not provided
export interface CreateSubcategoryInput {
  categoryId: string;
  slug?: SubcategoryId;
  icon?: string | null;
  sortOrder?: number;
  i18n: SubcategoryI18nInput[]; // at least one locale
}

export interface UpdateSubcategoryInput {
  icon?: string | null;
  sortOrder?: number;
  i18n?: SubcategoryI18nInput[]; // optional; if provided, upsert per-locale
}

export interface SubcategoryDto {
  id: number;
  categoryId: string;
  slug: SubcategoryId;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  i18n: Array<{ locale: string; name: string; description: string | null }>;
}

/**
 * CRUD service for sub-categories using TypeORM.
 */
export class SubCategoriesDBServices {
  private subcategoryRepo: Repository<Subcategory>;
  private subcategoryI18nRepo: Repository<SubcategoryI18n>;
  private categoryRepo: Repository<Category>;

  constructor(private dataSource: DataSource) {
    this.subcategoryRepo = dataSource.getRepository(Subcategory);
    this.subcategoryI18nRepo = dataSource.getRepository(SubcategoryI18n);
    this.categoryRepo = dataSource.getRepository(Category);
  }

  // Same slugify logic as routes
  private slugify(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSubcategorySlug(
    categoryId: string,
    base: string
  ): Promise<string> {
    let candidate = base || 'subcategory';
    let suffix = 2;
    while (true) {
      const exists = await this.subcategoryRepo.findOne({
        where: { categoryId, slug: candidate },
      });
      if (!exists) return candidate;
      candidate = `${base}-${suffix++}`;
    }
  }

  async findAll({
    where = {},
    order = { sortOrder: 'ASC', slug: 'ASC' },
    select,
  }: {
    where?: FindOptionsWhere<Subcategory> | FindOptionsWhere<Subcategory>[];
    order?: FindOptionsOrder<Subcategory>;
    select?: FindOptionsSelect<Subcategory>;
  } = {}): Promise<SubcategoryDto[]> {
    const subcategories = await this.subcategoryRepo.find({
      where,
      order,
      select,
      relations: {
        i18n: true,
      },
    });

    return subcategories.map((subcategory) => ({
      id: subcategory.id,
      categoryId: subcategory.categoryId,
      slug: subcategory.slug,
      icon: subcategory.icon ?? null,
      sortOrder: subcategory.sortOrder,
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt,
      i18n: subcategory.i18n
        ? subcategory.i18n
            .map((i18nItem) => ({
              locale: i18nItem.locale,
              name: i18nItem.name,
              description: i18nItem.description ?? null,
            }))
            .sort((a, b) => a.locale.localeCompare(b.locale))
        : [],
    }));
  }

  async findOne(
    params: FindOneOptions<Subcategory>
  ): Promise<SubcategoryDto | null> {
    const options = { ...params };
    if (!options.relations) {
      options.relations = { i18n: true };
    } else if (
      typeof options.relations === 'object' &&
      !Array.isArray(options.relations)
    ) {
      options.relations = { ...options.relations, i18n: true };
    }

    const subcategory = await this.subcategoryRepo.findOne(options);
    if (!subcategory) return null;

    return {
      id: subcategory.id,
      categoryId: subcategory.categoryId,
      slug: subcategory.slug,
      icon: subcategory.icon ?? null,
      sortOrder: subcategory.sortOrder,
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt,
      i18n: subcategory.i18n
        ? subcategory.i18n.map((i18nItem) => ({
            locale: i18nItem.locale,
            name: i18nItem.name,
            description: i18nItem.description ?? null,
          }))
        : [],
    };
  }

  async findBySlugAndCategory(
    categoryId: string,
    slug: SubcategoryId
  ): Promise<SubcategoryDto | null> {
    const subcategory = await this.subcategoryRepo.findOne({
      where: { categoryId, slug },
      relations: {
        i18n: true,
      },
    });

    if (!subcategory) return null;

    return {
      id: subcategory.id,
      categoryId: subcategory.categoryId,
      slug: subcategory.slug,
      icon: subcategory.icon ?? null,
      sortOrder: subcategory.sortOrder,
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt,
      i18n: subcategory.i18n
        ? subcategory.i18n.map((i18nItem) => ({
            locale: i18nItem.locale,
            name: i18nItem.name,
            description: i18nItem.description ?? null,
          }))
        : [],
    };
  }

  async create(
    input: CreateSubcategoryInput
  ): Promise<{ categoryId: string; slug: SubcategoryId; created: true }> {
    if (!input.i18n || input.i18n.length === 0) {
      throw new Error('At least one i18n entry is required');
    }

    const category = await this.categoryRepo.findOne({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new Error(`Category not found: ${input.categoryId}`);
    }

    const preferred =
      input.i18n.find((e) => e.locale.toLowerCase() === 'en') ?? input.i18n[0];
    const baseSlug = input.slug || this.slugify(preferred.name);
    const slug = await this.ensureUniqueSubcategorySlug(
      input.categoryId,
      baseSlug
    );

    let subcategory = this.subcategoryRepo.create({
      categoryId: input.categoryId,
      slug,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder ?? 0,
      category,
    });
    subcategory = await this.subcategoryRepo.save(subcategory);

    for (const entry of input.i18n) {
      const rec = this.subcategoryI18nRepo.create({
        subcategory,
        locale: entry.locale,
        name: entry.name,
        description: entry.description ?? null,
      });
      await this.subcategoryI18nRepo.save(rec);
    }

    return { categoryId: input.categoryId, slug, created: true } as const;
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
    const subcategory = await this.subcategoryRepo.findOne({
      where: { categoryId, slug },
      relations: { category: true },
    });
    if (!subcategory) {
      throw new Error(`Subcategory not found: ${categoryId}/${slug}`);
    }

    subcategory.icon = input.icon ?? subcategory.icon ?? null;
    if (typeof input.sortOrder === 'number') {
      subcategory.sortOrder = input.sortOrder;
    }

    const updatedLocales: string[] = [];
    if (input.i18n && input.i18n.length > 0) {
      // If i18n is being updated, also update the denormalized `name` field
      const preferred =
        input.i18n.find((e) => e.locale.toLowerCase() === 'en') ??
        input.i18n[0];
      if (preferred) {
        (subcategory as any).name = preferred.name;
      }

      for (const entry of input.i18n) {
        const existing = await this.subcategoryI18nRepo.findOne({
          where: { subcategory: { id: subcategory.id }, locale: entry.locale },
          relations: { subcategory: true },
        });
        if (existing) {
          existing.name = entry.name;
          existing.description = entry.description ?? null;
          await this.subcategoryI18nRepo.save(existing);
        } else {
          const rec = this.subcategoryI18nRepo.create({
            subcategory,
            locale: entry.locale,
            name: entry.name,
            description: entry.description ?? null,
          });
          await this.subcategoryI18nRepo.save(rec);
        }
        updatedLocales.push(entry.locale);
      }
    }

    await this.subcategoryRepo.save(subcategory);

    return { categoryId, slug, updated: true, updatedLocales } as const;
  }

  async delete(categoryId: string, slug: SubcategoryId): Promise<boolean> {
    const res = await this.subcategoryRepo.delete({ categoryId, slug });
    return (res.affected ?? 0) > 0;
  }

  async count(categoryId?: string): Promise<number> {
    if (categoryId) {
      return this.subcategoryRepo.count({ where: { categoryId } });
    }
    return this.subcategoryRepo.count();
  }

  async findByCategoryId(categoryId: string): Promise<SubcategoryDto[]> {
    return this.findAll({
      where: { categoryId },
      order: { sortOrder: 'ASC', slug: 'ASC' },
    });
  }
}

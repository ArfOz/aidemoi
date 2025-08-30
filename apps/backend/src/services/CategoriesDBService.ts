// apps/backend/src/services/CategoriesService.ts
import {
  DataSource,
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOneOptions,
} from 'typeorm';
import { Category, CategoryI18n } from '../entities/Category';
import { Subcategory, SubcategoryI18n } from '../entities/Subcategory';

export type CategoryId = string; // slug primary key (e.g., "moving")

export interface CategoryI18nInput {
  locale: string;
  name: string;
  description?: string | null;
}

export interface CreateCategoryInput {
  icon?: string | null;
  sortOrder?: number;
  i18n: CategoryI18nInput[]; // at least one locale
}

export interface UpdateCategoryInput {
  icon?: string | null;
  sortOrder?: number;
  i18n?: CategoryI18nInput[]; // optional; if provided, upsert per-locale
}

export interface CategoryDto {
  id: CategoryId;
  name: string | null;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  i18n: Array<{ locale: string; name: string; description: string | null }>;
}

export class CategoriesDBService {
  private categoryRepo: Repository<Category>;
  private categoryI18nRepo: Repository<CategoryI18n>;
  private subcategoryRepo: Repository<Subcategory>;
  private subcategoryI18nRepo: Repository<SubcategoryI18n>;

  constructor(private dataSource: DataSource) {
    this.categoryRepo = dataSource.getRepository(Category);
    this.categoryI18nRepo = dataSource.getRepository(CategoryI18n);
    this.subcategoryRepo = dataSource.getRepository(Subcategory);
    this.subcategoryI18nRepo = dataSource.getRepository(SubcategoryI18n);
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

  private async ensureUniqueCategoryId(base: string): Promise<string> {
    let candidate = base || 'category';
    let suffix = 2;
    while (true) {
      const exists = await this.categoryRepo.findOne({
        where: { id: candidate },
      });
      if (!exists) return candidate;
      candidate = `${base}-${suffix++}`;
    }
  }

  async findAll({
    where = {},
    order = { sortOrder: 'ASC', id: 'ASC' },
    select,
  }: {
    where?: FindOptionsWhere<Category> | FindOptionsWhere<Category>[];
    order?: FindOptionsOrder<Category>;
    select?: FindOptionsSelect<Category>;
  } = {}): Promise<CategoryDto[]> {
    // Get categories with their i18n data in a single query
    const categories = await this.categoryRepo.find({
      where,
      order,
      select,
      relations: {
        i18n: true,
      },
    });

    // Convert to DTOs
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon ?? null,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      i18n: category.i18n
        ? category.i18n
            .map((i18nItem) => ({
              locale: i18nItem.locale,
              name: i18nItem.name,
              description: i18nItem.description ?? null,
            }))
            .sort((a, b) => a.locale.localeCompare(b.locale))
        : [],
    }));
  }

  async findOne(params: FindOneOptions<Category>): Promise<CategoryDto | null> {
    // Ensure we have i18n relations
    const options = { ...params };
    if (!options.relations) {
      options.relations = { i18n: true };
    } else if (
      typeof options.relations === 'object' &&
      !Array.isArray(options.relations)
    ) {
      options.relations = { ...options.relations, i18n: true };
    }

    const category = await this.categoryRepo.findOne(options);
    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      icon: category.icon ?? null,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      i18n: category.i18n
        ? category.i18n.map((i18nItem) => ({
            locale: i18nItem.locale,
            name: i18nItem.name,
            description: i18nItem.description ?? null,
          }))
        : [],
    };
  }

  async findById(id: CategoryId): Promise<CategoryDto | null> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: {
        i18n: true,
      },
    });

    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      icon: category.icon ?? null,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      i18n: category.i18n
        ? category.i18n.map((i18nItem) => ({
            locale: i18nItem.locale,
            name: i18nItem.name,
            description: i18nItem.description ?? null,
          }))
        : [],
    };
  }

  async create(
    input: CreateCategoryInput
  ): Promise<{ id: CategoryId; created: true }> {
    if (!input.i18n || input.i18n.length === 0) {
      throw new Error('At least one i18n entry is required');
    }

    const preferred =
      input.i18n.find((e) => e.locale.toLowerCase() === 'en') ?? input.i18n[0];
    const baseSlug = this.slugify(preferred.name);
    const id = await this.ensureUniqueCategoryId(baseSlug);

    let category = this.categoryRepo.create({
      id,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder ?? 0,
      name: preferred.name,
    });
    category = await this.categoryRepo.save(category);

    for (const entry of input.i18n) {
      const rec = this.categoryI18nRepo.create({
        category,
        locale: entry.locale,
        name: entry.name,
        description: entry.description ?? null,
      });
      await this.categoryI18nRepo.save(rec);
    }

    return { id, created: true } as const;
  }

  async update(
    id: CategoryId,
    input: UpdateCategoryInput
  ): Promise<{ id: CategoryId; updated: true; updatedLocales: string[] }> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new Error(`Category not found: ${id}`);

    category.icon = input.icon ?? category.icon ?? null;
    if (typeof input.sortOrder === 'number')
      category.sortOrder = input.sortOrder;
    await this.categoryRepo.save(category);

    const updatedLocales: string[] = [];
    if (input.i18n && input.i18n.length > 0) {
      for (const entry of input.i18n) {
        const existing = await this.categoryI18nRepo.findOne({
          where: { category: { id }, locale: entry.locale },
          relations: { category: true },
        });
        if (existing) {
          existing.name = entry.name;
          existing.description = entry.description ?? null;
          await this.categoryI18nRepo.save(existing);
        } else {
          const rec = this.categoryI18nRepo.create({
            category,
            locale: entry.locale,
            name: entry.name,
            description: entry.description ?? null,
          });
          await this.categoryI18nRepo.save(rec);
        }
        updatedLocales.push(entry.locale);
      }
    }

    return { id, updated: true, updatedLocales } as const;
  }

  async delete(id: CategoryId): Promise<boolean> {
    const res = await this.categoryRepo.delete(id);
    return (res.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.categoryRepo.count();
  }
}

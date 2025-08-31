import { DataSource, Repository, FindManyOptions } from 'typeorm';

// Assuming you have these entities - adjust imports based on your actual entity structure
// import { CategoryI18n } from '../../entities/CategoryI18n';
// import { Category } from '../../entities/Category';

// Temporary interface - replace with actual entity when available
interface CategoryI18nEntity {
  id: string;
  categoryId: string;
  locale: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryI18nData {
  categoryId: string;
  locale: string;
  name: string;
  description?: string | null;
}

export interface UpdateCategoryI18nData {
  name?: string;
  description?: string | null;
}

export class Categoriesi18nService {
  private categoryI18nRepo: Repository<CategoryI18nEntity>;

  constructor(dataSource: DataSource) {
    // Replace 'CategoryI18n' with your actual entity class name
    this.categoryI18nRepo = dataSource.getRepository('CategoryI18n' as any);
  }

  async create(data: CreateCategoryI18nData): Promise<CategoryI18nEntity> {
    const categoryI18n = this.categoryI18nRepo.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.categoryI18nRepo.save(categoryI18n);
  }

  async findById(id: string): Promise<CategoryI18nEntity | null> {
    return await this.categoryI18nRepo.findOne({
      where: { id } as any,
    });
  }

  async findByLocaleAndCategory(
    categoryId: string,
    locale: string
  ): Promise<CategoryI18nEntity | null> {
    return await this.categoryI18nRepo.findOne({
      where: { categoryId, locale } as any,
    });
  }

  async findByCategoryId(categoryId: string): Promise<CategoryI18nEntity[]> {
    return await this.categoryI18nRepo.find({
      where: { categoryId } as any,
      order: { locale: 'ASC' } as any,
    });
  }

  async findByLocale(locale: string): Promise<CategoryI18nEntity[]> {
    return await this.categoryI18nRepo.find({
      where: { locale } as any,
      order: { name: 'ASC' } as any,
    });
  }

  async findAll(
    options?: FindManyOptions<CategoryI18nEntity>
  ): Promise<CategoryI18nEntity[]> {
    return await this.categoryI18nRepo.find(options);
  }

  async update(
    id: string,
    data: UpdateCategoryI18nData
  ): Promise<CategoryI18nEntity | null> {
    const categoryI18n = await this.findById(id);
    if (!categoryI18n) {
      return null;
    }

    Object.assign(categoryI18n, {
      ...data,
      updatedAt: new Date(),
    });

    return await this.categoryI18nRepo.save(categoryI18n);
  }

  async updateByLocaleAndCategory(
    categoryId: string,
    locale: string,
    data: UpdateCategoryI18nData
  ): Promise<CategoryI18nEntity | null> {
    const categoryI18n = await this.findByLocaleAndCategory(categoryId, locale);
    if (!categoryI18n) {
      return null;
    }

    return await this.update(categoryI18n.id, data);
  }

  async upsert(data: CreateCategoryI18nData): Promise<{
    entity: CategoryI18nEntity;
    created: boolean;
  }> {
    const existing = await this.findByLocaleAndCategory(
      data.categoryId,
      data.locale
    );

    if (existing) {
      const updated = await this.update(existing.id, {
        name: data.name,
        description: data.description,
      });
      return {
        entity: updated!,
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

  async delete(id: string): Promise<boolean> {
    const result = await this.categoryI18nRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByLocaleAndCategory(
    categoryId: string,
    locale: string
  ): Promise<boolean> {
    const result = await this.categoryI18nRepo.delete({
      categoryId,
      locale,
    } as any);
    return (result.affected ?? 0) > 0;
  }

  async deleteByCategoryId(categoryId: string): Promise<number> {
    const result = await this.categoryI18nRepo.delete({
      categoryId,
    } as any);
    return result.affected || 0;
  }

  async count(categoryId?: string): Promise<number> {
    if (categoryId) {
      return await this.categoryI18nRepo.count({
        where: { categoryId } as any,
      });
    }
    return await this.categoryI18nRepo.count();
  }

  async getAvailableLocales(categoryId?: string): Promise<string[]> {
    const queryBuilder = this.categoryI18nRepo.createQueryBuilder('ci18n');

    if (categoryId) {
      queryBuilder.where('ci18n.categoryId = :categoryId', { categoryId });
    }

    const results = await queryBuilder
      .select('DISTINCT ci18n.locale', 'locale')
      .orderBy('ci18n.locale', 'ASC')
      .getRawMany();

    return results.map((r) => r.locale);
  }
}

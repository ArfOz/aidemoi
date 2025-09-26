import { Prisma, PrismaClient, Question } from '@prisma/client';

export class QuestionsDBService {
  constructor(private prisma: PrismaClient) {}

  async findAll({
    where,
    language,
    select,
    orderBy,
  }: {
    where?: Prisma.QuestionWhereInput;
    language?: string;
    select?: Prisma.QuestionSelect;
    orderBy?: Prisma.QuestionOrderByWithRelationInput[];
  } = {}): Promise<Question[]> {
    if (language) {
      // Ensure translations and options translations are filtered by language
      where = {
        ...where,
        translations: { some: { locale: language } },
      };
    }

    return await this.prisma.question.findMany({
      where,
      orderBy: orderBy || [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: select || undefined,
    });
  }

  async findById({
    where,
    language,
  }: {
    where: Prisma.QuestionWhereUniqueInput;
    language?: string;
  }): Promise<Question | null> {
    return await this.prisma.question.findUnique({
      where,
      select: {
        id: true,
        subcategoryId: true,
        isActive: true,
        sortOrder: true,
        type: true,
        required: true,
        validation: true,
        translations: {
          where: {
            locale: language || 'en',
          },
        },
        options: {
          include: {
            translations: {
              where: {
                locale: language || 'en',
              },
            },
          },
        },
      },
    });
  }

  async findBySubcategory({
    subcategoryId,
    language,
    activeOnly = true,
  }: {
    subcategoryId: number;
    language?: string;
    activeOnly?: boolean;
  }): Promise<Question[]> {
    return await this.findAll({
      where: {
        subcategoryId,
        ...(activeOnly && { isActive: true }),
      },
      language: language && language.length > 0 ? language[0] : undefined,
    });
  }

  async create(input: Prisma.QuestionCreateInput): Promise<Question> {
    const created = await this.prisma.question.create({
      data: input,
    });
    return created;
  }

  async update(
    where: Prisma.QuestionWhereUniqueInput,
    data: Prisma.QuestionUpdateInput
  ): Promise<Question> {
    const updated = await this.prisma.question.update({
      where,
      data,
    });
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.question.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async softDelete(id: number): Promise<Question> {
    return await this.prisma.question.update({
      where: { id },
      data: { isActive: false },
      include: {
        subcategory: {
          include: {
            category: true,
            i18n: true,
          },
        },
      },
    });
  }

  async activate(id: number): Promise<Question> {
    return await this.prisma.question.update({
      where: { id },
      data: { isActive: true },
      include: {
        subcategory: {
          include: {
            category: true,
            i18n: true,
          },
        },
      },
    });
  }

  async updateSortOrder(
    updates: { id: number; sortOrder: number }[]
  ): Promise<void> {
    await this.prisma.$transaction(
      updates.map(({ id, sortOrder }) =>
        this.prisma.question.update({
          where: { id },
          data: { sortOrder },
        })
      )
    );
  }

  async count({
    where,
  }: {
    where?: Prisma.QuestionWhereInput;
  } = {}): Promise<number> {
    return this.prisma.question.count({ where });
  }

  async countBySubcategory(subcategoryId: number): Promise<number> {
    return this.count({
      where: {
        subcategoryId,
        isActive: true,
      },
    });
  }
}

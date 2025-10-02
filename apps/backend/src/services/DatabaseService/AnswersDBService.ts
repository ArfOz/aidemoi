import { PrismaClient, Answer, Prisma } from '@prisma/client';

export class AnswersDBService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new answer
   */
  async create(data: Prisma.AnswerCreateInput): Promise<Answer> {
    return this.prisma.answer.create({
      data: data,
      include: {
        user: true,
        question: {
          include: {
            translations: true,
            subcategory: true,
          },
        },
        option: {
          include: {
            translations: true,
          },
        },
      },
    });
  }

  /**
   * Update an existing answer
   */
  async update(id: number, data: Prisma.AnswerUpdateInput): Promise<Answer> {
    return this.prisma.answer.update({
      where: { id },
      data,
      include: {
        user: true,
        question: {
          include: {
            translations: true,
            subcategory: true,
          },
        },
        option: {
          include: {
            translations: true,
          },
        },
      },
    });
  }

  /**
   * Find by ID
   */
  async findById(id: number): Promise<Answer | null> {
    return this.prisma.answer.findUnique({
      where: { id },
      include: {
        user: true,
        question: {
          include: {
            translations: true,
            subcategory: true,
          },
        },
        option: {
          include: {
            translations: true,
          },
        },
      },
    });
  }

  /**
   * Find all with filters
   */
  async findAll(filters?: Prisma.AnswerWhereInput): Promise<Answer[]> {
    const where: Prisma.AnswerWhereInput = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.questionId) where.questionId = filters.questionId;
    if (filters?.optionId) where.optionId = filters.optionId;

    return this.prisma.answer.findMany({
      where,
      include: {
        user: true,
        question: {
          include: {
            translations: true,
            subcategory: true,
          },
        },
        option: {
          include: {
            translations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete by ID
   */
  async delete(id: number): Promise<Answer> {
    return this.prisma.answer.delete({
      where: { id },
    });
  }

  /**
   * Find answers by subcategory ID
   */
  async findAnswersBySubcategoryId(
    subcategoryId: number,
    userId?: number
  ): Promise<Answer[]> {
    const where: Prisma.AnswerWhereInput = {
      question: {
        subcategoryId,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    return this.prisma.answer.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        question: {
          include: {
            translations: true,
          },
        },
        option: {
          include: {
            translations: true,
          },
        },
      },
      orderBy: [{ question: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
    });
  }

  /**
   * Find user's answer for a specific question
   */
  async findUserAnswerForQuestion(
    userId: number,
    questionId: number
  ): Promise<Answer[]> {
    return this.prisma.answer.findMany({
      where: {
        userId,
        questionId,
      },
      include: {
        question: {
          include: {
            translations: true,
          },
        },
        option: {
          include: {
            translations: true,
          },
        },
      },
    });
  }

  /**
   * Delete user's answers for a specific question
   */
  async deleteUserAnswersForQuestion(
    userId: number,
    questionId: number
  ): Promise<{ count: number }> {
    return this.prisma.answer.deleteMany({
      where: {
        userId,
        questionId,
      },
    });
  }

  /**
   * Get answer statistics for a question
   */
  async getQuestionAnswerStats(questionId: number): Promise<{
    totalAnswers: number;
    optionCounts: { optionId: number; count: number; label?: string }[];
  }> {
    const totalAnswers = await this.prisma.answer.count({
      where: { questionId },
    });

    const optionCounts = await this.prisma.answer.groupBy({
      by: ['optionId'],
      where: {
        questionId,
        optionId: { not: null },
      },
      _count: {
        optionId: true,
      },
    });

    const formattedCounts = optionCounts.map((count) => ({
      optionId: count.optionId!,
      count: count._count.optionId,
    }));

    return {
      totalAnswers,
      optionCounts: formattedCounts,
    };
  }

  /**
   * Check if user has completed a subcategory
   */
  async hasUserCompletedSubcategory(
    userId: number,
    subcategoryId: number
  ): Promise<boolean> {
    const questions = await this.prisma.question.findMany({
      where: {
        subcategoryId,
        isActive: true,
        required: true,
      },
      select: { id: true },
    });

    const answeredQuestions = await this.prisma.answer.findMany({
      where: {
        userId,
        questionId: { in: questions.map((q) => q.id) },
      },
      select: { questionId: true },
      distinct: ['questionId'],
    });

    return answeredQuestions.length === questions.length;
  }
}

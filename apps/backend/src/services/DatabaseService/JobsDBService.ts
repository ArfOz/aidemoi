import { Prisma, PrismaClient, Job, JobStatus } from '@prisma/client';

export type JobWithDetailsAndAnswers = Job & {
  subcategory: {
    id: number;
    slug: string;
    name: string | null;
    i18n: Array<{
      locale: string;
      name: string;
      description: string | null;
    }>;
  };
  user: {
    id: number;
    email: string;
    username: string | null;
  };
  answers: Array<{
    id: number;
    textValue: string | null;
    numberValue: number | null;
    dateValue: Date | null;
    inputLanguage: string | null;
    createdAt: Date;
    updatedAt: Date;
    question: {
      id: number;
      type: string;
      required: boolean;
      sortOrder: number;
      validation: string | null;
      translations: Array<{
        locale: string;
        label: string;
        description: string | null;
      }>;
      options: Array<{
        id: number;
        value: string;
        translations: Array<{
          locale: string;
          label: string;
        }>;
      }>;
    };
    option: {
      id: number;
      value: string;
      translations: Array<{
        locale: string;
        label: string;
      }>;
    } | null;
  }>;
};

export class JobsDBService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new job
   */
  async create(data: Prisma.JobCreateInput): Promise<Job> {
    const job = await this.prisma.job.create({
      data: {
        ...data,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return job;
  }

  /**
   * Find job by ID with full details
   */
  async findUnique(id: number, locale?: string): Promise<Job | null> {
    const translationWhere = locale ? { locale } : undefined;

    return await this.prisma.job.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        subcategory: {
          include: {
            category: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                translations: translationWhere
                  ? { where: translationWhere }
                  : true,
              },
            },
            option: {
              include: {
                translations: translationWhere
                  ? { where: translationWhere }
                  : true,
              },
            },
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    });
  }

  /**
   * Find all jobs with filters
   */
  async findMany(locale?: string): Promise<Job[]> {
    const translationWhere = locale ? { locale } : undefined;

    const whereClause: any = {};

    return await this.prisma.job.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        subcategory: {
          include: {
            category: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                translations: translationWhere
                  ? { where: translationWhere }
                  : true,
              },
            },
            option: {
              include: {
                translations: translationWhere
                  ? { where: translationWhere }
                  : true,
              },
            },
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update job
   */
  async update(id: number, data: Prisma.JobUpdateInput): Promise<Job | null> {
    try {
      return await this.prisma.job.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      });
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        return null; // Job not found
      }
      throw error;
    }
  }

  /**
   * Update job status
   */
  async updateStatus(id: number, status: JobStatus): Promise<Job | null> {
    return await this.update(id, { status });
  }

  /**
   * Delete job
   */
  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.job.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        return false; // Job not found
      }
      throw error;
    }
  }

  /**
   * Connect answers to a job
   */
  async connectAnswers(
    jobId: number,
    answerIds: number[]
  ): Promise<Job | null> {
    try {
      return await this.prisma.job.update({
        where: { id: jobId },
        data: {
          answers: {
            connect: answerIds.map((id) => ({ id })),
          },
        },
      });
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        return null; // Job not found
      }
      throw error;
    }
  }

  /**
   * Disconnect answers from a job
   */
  async disconnectAnswers(
    jobId: number,
    answerIds: number[]
  ): Promise<Job | null> {
    try {
      return await this.prisma.job.update({
        where: { id: jobId },
        data: {
          answers: {
            disconnect: answerIds.map((id) => ({ id })),
          },
        },
      });
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        return null; // Job not found
      }
      throw error;
    }
  }

  /**
   * Get job statistics
   */
  async getStats(userId?: number) {
    const whereClause = userId ? { userId } : {};

    const [total, open, inProgress, completed, cancelled] = await Promise.all([
      this.prisma.job.count({ where: whereClause }),
      this.prisma.job.count({ where: { ...whereClause, status: 'OPEN' } }),
      this.prisma.job.count({
        where: { ...whereClause, status: 'IN_PROGRESS' },
      }),
      this.prisma.job.count({ where: { ...whereClause, status: 'COMPLETED' } }),
      this.prisma.job.count({ where: { ...whereClause, status: 'CANCELLED' } }),
    ]);

    return {
      total,
      open,
      inProgress,
      completed,
      cancelled,
    };
  }

  async findUniqueWithAnswersAndQuestions(
    where: Prisma.JobWhereUniqueInput,
    locale?: string
  ): Promise<JobWithDetailsAndAnswers | null> {
    return await this.prisma.job.findUnique({
      where,
      include: {
        subcategory: {
          include: {
            i18n: locale
              ? {
                  where: { locale },
                }
              : true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                translations: locale
                  ? {
                      where: { locale },
                    }
                  : true,
                options: {
                  include: {
                    translations: locale
                      ? {
                          where: { locale },
                        }
                      : true,
                  },
                },
              },
            },
            option: {
              include: {
                translations: locale
                  ? {
                      where: { locale },
                    }
                  : true,
              },
            },
          },
          orderBy: {
            question: {
              sortOrder: 'asc',
            },
          },
        },
      },
    });
  }

  async findManyWithAnswersAndQuestions(
    opts: {
      where?: Prisma.JobWhereInput;
      orderBy?: Prisma.JobOrderByWithRelationInput;
      take?: number;
      skip?: number;
      locale?: string;
    } = {}
  ): Promise<JobWithDetailsAndAnswers[]> {
    return await this.prisma.job.findMany({
      where: opts.where,
      include: {
        subcategory: {
          include: {
            i18n: opts.locale
              ? {
                  where: { locale: opts.locale },
                }
              : true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                translations: opts.locale
                  ? {
                      where: { locale: opts.locale },
                    }
                  : true,
                options: {
                  include: {
                    translations: opts.locale
                      ? {
                          where: { locale: opts.locale },
                        }
                      : true,
                  },
                },
              },
            },
            option: {
              include: {
                translations: opts.locale
                  ? {
                      where: { locale: opts.locale },
                    }
                  : true,
              },
            },
          },
          orderBy: {
            question: {
              sortOrder: 'asc',
            },
          },
        },
      },
      orderBy: opts.orderBy,
      take: opts.take,
      skip: opts.skip,
    });
  }
}

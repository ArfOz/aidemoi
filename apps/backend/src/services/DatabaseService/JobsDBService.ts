import { Prisma, PrismaClient, Job, JobStatus } from '@prisma/client';

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
    where: Prisma.JobWhereUniqueInput
  ): Promise<Job | null> {
    return await this.prisma.job.findUnique({
      where,
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
              },
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
    } = {}
  ): Promise<Job[]> {
    return await this.prisma.job.findMany({
      where: opts.where,
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
              },
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

import { PrismaClient, Bid, Prisma } from '@prisma/client';

export class BidsDBService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new bid
   */
  async create(data: Prisma.BidCreateInput): Promise<Bid> {
    // Check if user already has a bid for this job

    return await this.prisma.bid.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Find bid by ID with full details
   */
  //   async findByUnique(where: Prisma.BidWhereUniqueInput): Promise<Bid | null> {
  //     return await this.prisma.bid.findUnique({
  //       where,
  //         include: {
  //             user: {
  //                 select: {
  //                     id: true,
  //                     username: true,
  //                     email: true,
  //                 },
  //             },
  //             job: {
  //                 include: {
  //                     user: {
  //                         select: {
  //                             id: true,
  //                             username: true,
  //                             email: true,
  //                         },
  //                     },
  //                     subcategory: {
  //                         include: {
  //                             category: {
  //                                 select: {
  //                                     id: true,
  //                                     name: true,
  //                                 },
  //                             },
  //                         },
  //                     },
  //                 },
  //             },
  //         });

  //     }

  /**
   * Find all bids with filters
   */
  async findMany(where: Prisma.BidWhereInput): Promise<Bid[]> {
    return await this.prisma.bid.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        job: {
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
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find bids by job ID
   */
  async findByJobId(jobId: number): Promise<Bid[]> {
    return this.findMany({ jobId });
  }

  /**
   * Find bids by user ID
   */
  async findByUserId(userId: number): Promise<Bid[]> {
    return this.findMany({ userId });
  }

  /**
   * Update bid
   */
  async update(id: number, data: Prisma.BidUpdateInput): Promise<Bid | null> {
    try {
      // Check if bid exists and is still pending
      const existingBid = await this.prisma.bid.findUnique({
        where: { id },
        select: { status: true, userId: true },
      });

      if (!existingBid) {
        return null;
      }

      if (existingBid.status !== 'PENDING') {
        throw new Error('Cannot update bid that has been accepted or rejected');
      }

      return await this.prisma.bid.update({
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
          job: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        return null; // Bid not found
      }
      throw error;
    }
  }

  /**
   * Accept bid (and reject all others for the same job)
   */
  async acceptBid(bidId: number, jobOwnerId: number): Promise<Bid | null> {
    return this.prisma.$transaction(async (prisma) => {
      // Get the bid with job info
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: {
          job: {
            select: {
              id: true,
              userId: true,
              status: true,
            },
          },
        },
      });

      if (!bid) {
        throw new Error('Bid not found');
      }

      // Check if the user is the job owner
      if (bid.job.userId !== jobOwnerId) {
        throw new Error('Only job owner can accept bids');
      }

      // Check if job is still open
      if (bid.job.status !== 'OPEN') {
        throw new Error('Job is no longer open for bidding');
      }

      // Accept the bid
      const acceptedBid = await prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      });

      // Reject all other bids for this job
      await prisma.bid.updateMany({
        where: {
          jobId: bid.jobId,
          id: { not: bidId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // Update job status to IN_PROGRESS
      await prisma.job.update({
        where: { id: bid.jobId },
        data: { status: 'IN_PROGRESS' },
      });

      return acceptedBid;
    });
  }

  /**
   * Reject bid
   */
  async rejectBid(bidId: number, jobOwnerId: number): Promise<Bid | null> {
    try {
      // Get the bid with job info
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: {
          job: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!bid) {
        return null;
      }

      // Check if the user is the job owner
      if (bid.job.userId !== jobOwnerId) {
        throw new Error('Only job owner can reject bids');
      }

      return await this.prisma.bid.update({
        where: { id: bidId },
        data: { status: 'REJECTED' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        return null; // Bid not found
      }
      throw error;
    }
  }

  /**
   * Delete bid (only if pending and by bid owner)
   */
  async delete(id: number, userId: number): Promise<boolean> {
    try {
      // Check if bid exists and belongs to user
      const bid = await this.prisma.bid.findUnique({
        where: { id },
        select: { userId: true, status: true },
      });

      if (!bid) {
        return false;
      }

      if (bid.userId !== userId) {
        throw new Error('Only bid owner can delete their bid');
      }

      if (bid.status !== 'PENDING') {
        throw new Error('Cannot delete bid that has been accepted or rejected');
      }

      await this.prisma.bid.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        return false; // Bid not found
      }
      throw error;
    }
  }

  /**
   * Get bid statistics for a job
   */
  async getJobBidStats(jobId: number) {
    const [total, pending, accepted, rejected, avgAmount, minAmount, maxAmount] = await Promise.all(
      [
        this.prisma.bid.count({ where: { jobId } }),
        this.prisma.bid.count({ where: { jobId, status: 'PENDING' } }),
        this.prisma.bid.count({ where: { jobId, status: 'ACCEPTED' } }),
        this.prisma.bid.count({ where: { jobId, status: 'REJECTED' } }),
        this.prisma.bid.aggregate({
          where: { jobId, amount: { not: null } },
          _avg: { amount: true },
        }),
        this.prisma.bid.aggregate({
          where: { jobId, amount: { not: null } },
          _min: { amount: true },
        }),
        this.prisma.bid.aggregate({
          where: { jobId, amount: { not: null } },
          _max: { amount: true },
        }),
      ],
    );

    return {
      total,
      pending,
      accepted,
      rejected,
      avgAmount: avgAmount._avg.amount,
      minAmount: minAmount._min.amount,
      maxAmount: maxAmount._max.amount,
    };
  }

  /**
   * Get bid statistics for a user
   */
  async getUserBidStats(userId: number) {
    const [total, pending, accepted, rejected] = await Promise.all([
      this.prisma.bid.count({ where: { userId } }),
      this.prisma.bid.count({ where: { userId, status: 'PENDING' } }),
      this.prisma.bid.count({ where: { userId, status: 'ACCEPTED' } }),
      this.prisma.bid.count({ where: { userId, status: 'REJECTED' } }),
    ]);

    const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

    return {
      total,
      pending,
      accepted,
      rejected,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    };
  }

  /**
   * Check if user can bid on job
   */
  async canUserBidOnJob(userId: number, jobId: number): Promise<boolean> {
    // Check if job exists and is open
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { status: true, userId: true },
    });

    if (!job || job.status !== 'OPEN' || job.userId === userId) {
      return false;
    }

    // Check if user already has a bid
    const existingBid = await this.prisma.bid.findFirst({
      where: { jobId, userId },
    });

    return !existingBid;
  }
}

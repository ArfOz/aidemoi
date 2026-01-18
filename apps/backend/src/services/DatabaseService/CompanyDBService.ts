import { Prisma, PrismaClient, Company } from '@prisma/client';

export class CompanyDBService {
  constructor(private prisma: PrismaClient) {} // injected by Fastify plugin

  /**
   * Find companies with optional filtering, pagination and ordering.
   */
  async findAll(opts?: {
    where?: Prisma.CompanyWhereInput;
    take?: number;
    skip?: number;
    orderBy?: Prisma.CompanyOrderByWithRelationInput;
  }): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: opts?.where,
      take: opts?.take,
      skip: opts?.skip,
      orderBy: opts?.orderBy,
    });
  }

  async findByEmail(email: string): Promise<Company | null> {
    // email is unique in the schema, use findUnique
    return this.prisma.company.findUnique({
      where: { email },
    });
  }

  /**
   * Find a company by numeric ID.
   */
  async findById(id: number): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  /**
   * Find first company by name.
   */
  async findByName(name: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { name },
    });
  }

  /**
   * Create a new company. Throws on unique constraint violations (P2002).
   */
  async create(companyData: Prisma.CompanyCreateInput): Promise<Company> {
    try {
      return await this.prisma.company.create({ data: companyData });
    } catch (error) {
      const known = error as Prisma.PrismaClientKnownRequestError;
      if (known?.code === 'P2002') {
        // unique constraint violation
        throw new Error('Unique constraint failed: a company with that value already exists');
      }
      throw error;
    }
  }

  /**
   * Update an existing company by ID. Returns updated company or null if not found.
   */
  async update(id: number, companyData: Prisma.CompanyUpdateInput): Promise<Company | null> {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: companyData,
      });
    } catch (error) {
      const known = error as Prisma.PrismaClientKnownRequestError;
      if (known?.code === 'P2025') {
        // Record to update not found
        return null;
      }
      if (known?.code === 'P2002') {
        throw new Error('Unique constraint failed: update would violate uniqueness');
      }
      throw error;
    }
  }

  /**
   * Delete a company by ID. Returns true if deleted, false if not found.
   */
  async deleteById(id: number): Promise<boolean> {
    try {
      await this.prisma.company.delete({ where: { id } });
      return true;
    } catch (error) {
      const known = error as Prisma.PrismaClientKnownRequestError;
      if (known?.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  /** Backwards-compatible alias */
  /** @deprecated use deleteById */
  async delete(id: number): Promise<boolean> {
    return this.deleteById(id);
  }

  /**
   * Return simple stats for a company (uses employeeCount from model).
   */
  async getCompanyStats(id: number): Promise<{
    id: number;
    name: string;
    status: Company['status'];
    createdAt: Date;
    employeeCount: number | null;
  } | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        employeeCount: true,
      },
    });

    if (!company) return null;

    return {
      id: company.id,
      name: company.name,
      status: company.status,
      createdAt: company.createdAt,
      employeeCount: company.employeeCount ?? null,
    };
  }
}

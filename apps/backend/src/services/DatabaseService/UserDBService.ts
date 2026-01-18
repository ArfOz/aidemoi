import { Prisma, PrismaClient } from '@prisma/client';
import { PasswordService } from '../PasswordService';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
}

export class UserDBService {
  constructor(private prisma: PrismaClient) {} // Will be injected by Fastify plugin

  async findAll({
    where,
    take,
    skip,
    orderBy,
  }: {
    where?: Prisma.UserWhereInput;
    take?: number;
    skip?: number;
    orderBy?: any;
  }) {
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
      },
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
      },
    });
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true, // Include password for auth
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(userData: CreateUserData) {
    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Hash the password
    const hashedPassword = await PasswordService.hashPassword(userData.password);

    // Create user with hashed password
    const savedUser = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    // Return user without password
    return savedUser;
  }

  async update(id: number, userData: UpdateUserData) {
    const updateData: any = { ...userData };

    // If password is being updated, hash it
    if (userData.password) {
      const passwordValidation = PasswordService.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      updateData.password = await PasswordService.hashPassword(userData.password);
    }

    await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async authenticateUser(email: string, password: string) {
    // Find user with password included
    const user = await this.findByEmailWithPassword(email);
    if (!user || !user.password) {
      return null;
    }

    // Compare password
    const isPasswordValid = await PasswordService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    return this.findById(user.id);
  }
}

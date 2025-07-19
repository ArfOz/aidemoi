import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/User';
import { PasswordService } from './PasswordService';

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

export class UserService {
  private userRepository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'username', 'email', 'createdAt', 'updatedAt'], // Exclude password
      order: { id: 'ASC' }
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'createdAt', 'updatedAt'] // Exclude password
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'createdAt', 'updatedAt'] // Exclude password
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email }
      // Include password for authentication
    });
  }

  async create(userData: CreateUserData): Promise<User> {
    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(
      userData.password
    );
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Hash the password
    const hashedPassword = await PasswordService.hashPassword(
      userData.password
    );

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    const savedUser = await this.userRepository.save(user);

    // Return user without password
    return (await this.findById(savedUser.id)) as User;
  }

  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const updateData: any = { ...userData };

    // If password is being updated, hash it
    if (userData.password) {
      const passwordValidation = PasswordService.validatePasswordStrength(
        userData.password
      );
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      updateData.password = await PasswordService.hashPassword(
        userData.password
      );
    }

    await this.userRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    // Find user with password included
    const user = await this.findByEmailWithPassword(email);
    if (!user || !user.password) {
      return null;
    }

    // Compare password
    const isPasswordValid = await PasswordService.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    return await this.findById(user.id);
  }
}

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { CreateUserDto, UpdateUserDto, LoginDto } from '../types';
import {
  AppError,
  NotFoundError,
  ConflictError,
  AuthenticationError,
} from '../utils/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class HealthUserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Check if username already exists
      const existingUser = await this.userRepository.findOne({
        where: { name: userData.username },
      });

      if (existingUser) {
        throw new ConflictError('Username already exists');
      }

      // Check if email already exists (if provided)
      if (userData.email) {
        const existingEmail = await this.userRepository.findOne({
          where: { email: userData.email },
        });

        if (existingEmail) {
          throw new ConflictError('Email already exists');
        }
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = this.userRepository.create({
        name: userData.username,
        email: userData.email,
        password_hash: passwordHash,
        userRole: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        region: userData.region,
        hospital_id: userData.hospital_id,
        license_number: userData.license_number,
        specialization: userData.specialization,
        isActive: true,
      } as any);

      const savedUser = await this.userRepository.save(user);
      return savedUser as unknown as User;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create user', 500);
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user', 500);
    }
  }

  async getUserByUsername(username: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { name: username },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user', 500);
    }
  }

  async updateUser(id: number, updateData: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Check if email is being updated and if it already exists
      if (updateData.email && updateData.email !== user.email) {
        const existingEmail = await this.userRepository.findOne({
          where: { email: updateData.email },
        });

        if (existingEmail) {
          throw new ConflictError('Email already exists');
        }
      }

      // Update user
      await this.userRepository.update(id, updateData as any);

      const updatedUser = await this.userRepository.findOne({
        where: { id },
      });

      if (!updatedUser) {
        throw new NotFoundError('User');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update user', 500);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      await this.userRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete user', 500);
    }
  }

  async login(loginData: LoginDto): Promise<{ user: User; token: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { name: loginData.username },
      });

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password_hash,
      );

      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.name,
          role: user.userRole,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' },
      );

      return { user, token };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to login', 500);
    }
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: { userRole: role, isActive: true },
      });

      return users;
    } catch {
      throw new AppError('Failed to get users by role', 500);
    }
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    byRole: { role: string; count: number }[];
    byRegion: { region: string; count: number }[];
  }> {
    try {
      const total = await this.userRepository.count();
      const active = await this.userRepository.count({
        where: { isActive: true },
      });

      const byRole = await this.userRepository
        .createQueryBuilder('user')
        .select('user.userRole', 'role')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.userRole')
        .getRawMany();

      const byRegion = await this.userRepository
        .createQueryBuilder('user')
        .select('user.region', 'region')
        .addSelect('COUNT(*)', 'count')
        .where('user.region IS NOT NULL')
        .groupBy('user.region')
        .getRawMany();

      return {
        total,
        active,
        byRole: byRole.map((item) => ({
          role: item.role,
          count: parseInt(item.count),
        })),
        byRegion: byRegion.map((item) => ({
          region: item.region,
          count: parseInt(item.count),
        })),
      };
    } catch {
      throw new AppError('Failed to get user statistics', 500);
    }
  }
}

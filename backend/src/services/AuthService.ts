// src/services/AuthService.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { IUser, User } from '../entities/User';
import {
  AlreadyExistException,
  InvalidInputException,
} from '../exception/CustomException';
import bcrypt from 'bcrypt';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import logger from '../config/logger';

class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  // Register a new user with JWT authentication
  async register(userData: IUser): Promise<User> {
    const { name, email, password, userRole, first_name, last_name } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new AlreadyExistException('User already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password!, saltRounds);

    // Create a new user entity
    const user = new User();
    user.name = name;
    user.email = email;
    user.password_hash = hashedPassword;
    user.userRole = userRole;
    user.first_name = first_name || '';
    user.last_name = last_name || '';
    user.isActive = true;

    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  // Login a user using JWT
  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; refreshToken: string; user: IUser }> {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new InvalidInputException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new InvalidInputException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new InvalidInputException('Invalid email or password');
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      userRole: user.userRole,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      ...tokenPayload,
      type: 'refresh',
    });

    return { token, refreshToken, user };
  }

  // Refresh token
  async refreshToken() {
    try {
      // In a real implementation, you would validate the refresh token
      // For now, we'll just generate a new token
      const token = generateToken({ id: 0, email: '', userRole: '' });
      const newRefreshToken = generateRefreshToken({
        id: 0,
        email: '',
        userRole: '',
        type: 'refresh',
      });

      return { token, refreshToken: newRefreshToken };
    } catch {
      logger.error('Invalid refresh token');
      throw new InvalidInputException('Invalid refresh token');
    }
  }

  // Logout (in JWT, logout is typically handled client-side by removing the token)
  async logout(): Promise<void> {
    // In a real implementation, you might want to blacklist the refresh token
    // For now, we'll just log the logout
    logger.info('User logged out');
  }

  // Validate token
  async validateToken(): Promise<IUser | null> {
    try {
      // This would typically involve verifying the JWT token
      // For now, we'll return null as this is handled by the middleware
      return null;
    } catch {
      return null;
    }
  }
}

export default new AuthService();

import { Request, Response, NextFunction } from 'express';
import { HealthUserService } from '../services/HealthUserService';
import { ResponseHandler } from '../utils/responseHandler';
import { CreateUserDto, UpdateUserDto, LoginDto } from '../types';
import { ValidationError, AuthorizationError } from '../utils/errors';

export class HealthAuthController {
  private userService: HealthUserService;

  constructor() {
    this.userService = new HealthUserService();
  }

  // POST /api/health/auth/register
  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;

      // Validate required fields
      if (
        !userData.username ||
        !userData.password ||
        !userData.first_name ||
        !userData.last_name ||
        !userData.role
      ) {
        throw new ValidationError('Missing required fields');
      }

      // Validate role
      const validRoles = ['doctor', 'patient', 'official'];
      if (!validRoles.includes(userData.role)) {
        throw new ValidationError('Invalid role');
      }

      // Validate email format if provided
      if (userData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          throw new ValidationError('Invalid email format');
        }
      }

      const user = await this.userService.createUser(userData);

      // Remove password from response
      const userWithoutPassword = { ...user } as any;
      delete userWithoutPassword.password_hash;

      ResponseHandler.created(
        res,
        userWithoutPassword,
        'User registered successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/health/auth/login
  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const loginData: LoginDto = req.body;

      // Validate required fields
      if (!loginData.username || !loginData.password) {
        throw new ValidationError('Username and password are required');
      }

      const result = await this.userService.login(loginData);

      // Remove password from response
      const userWithoutPassword = { ...result.user } as any;
      delete userWithoutPassword.password_hash;

      ResponseHandler.success(
        res,
        {
          user: userWithoutPassword,
          token: result.token,
        },
        'Login successful',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/health/auth/profile
  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // This would typically get the user ID from the JWT token
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AuthorizationError('User not authenticated');
      }

      const user = await this.userService.getUserById(userId);

      // Remove password from response
      const userWithoutPassword = { ...user } as any;
      delete userWithoutPassword.password_hash;

      ResponseHandler.success(
        res,
        userWithoutPassword,
        'Profile retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/health/auth/profile
  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AuthorizationError('User not authenticated');
      }

      const updateData: UpdateUserDto = req.body;

      const user = await this.userService.updateUser(userId, updateData);

      // Remove password from response
      const userWithoutPassword = { ...user } as any;
      delete userWithoutPassword.password_hash;

      ResponseHandler.success(
        res,
        userWithoutPassword,
        'Profile updated successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/health/auth/users
  getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const role = req.query.role as string;

      if (role) {
        const validRoles = ['doctor', 'patient', 'official'];
        if (!validRoles.includes(role)) {
          throw new ValidationError('Invalid role');
        }

        const users = await this.userService.getUsersByRole(role as any);
        const usersWithoutPasswords = users.map((user) => {
          const userWithoutPassword = { ...user } as any;
          delete userWithoutPassword.password_hash;
          return userWithoutPassword;
        });

        ResponseHandler.success(
          res,
          usersWithoutPasswords,
          'Users retrieved successfully',
        );
      } else {
        // For now, return empty array - in a real app you'd implement pagination
        ResponseHandler.success(res, [], 'Users retrieved successfully');
      }
    } catch (error) {
      next(error);
    }
  };

  // GET /api/health/auth/users/:id
  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new ValidationError('User ID is required');
      }
      const id = parseInt(idParam);

      if (isNaN(id)) {
        throw new ValidationError('Invalid user ID');
      }

      const user = await this.userService.getUserById(id);

      // Remove password from response
      const userWithoutPassword = { ...user } as any;
      delete userWithoutPassword.password_hash;

      ResponseHandler.success(
        res,
        userWithoutPassword,
        'User retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/health/auth/stats
  getUserStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();

      ResponseHandler.success(
        res,
        stats,
        'User statistics retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/responseUtil';
// import { CustomException } from '../exception/CustomException';
import { userService } from '../services/userService';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    userRole: string;
    isActive: boolean;
  };
}

export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    ResponseUtil.errorResponse(res, 401, 'Token cookie missing');
    return;
  }

  try {
    // Verify JWT token
    const decoded = verifyToken(token);

    // Get user data from database
    const userData = await userService.getUserById(decoded.id);
    if (!userData) {
      ResponseUtil.errorResponse(res, 401, 'User not found', 401);
      return;
    }

    // Check if user is active
    if (!userData.isActive) {
      ResponseUtil.errorResponse(res, 401, 'User account is inactive', 401);
      return;
    }

    req.user = userData;

    return next();
  } catch (error) {
    console.error('JWT verification error:', error);
    ResponseUtil.errorResponse(res, 401, 'Unauthorized access');
    return;
  }
};

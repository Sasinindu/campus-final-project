import { Request, Response } from 'express';
import authService from '../services/AuthService';
import { ResponseUtil } from '../utils/responseUtil';
import { CustomException } from '../exception/CustomException';
import { AuthRequest } from '../middlewares/auth.middleware';
import logger from '../config/logger';

export default class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const result = await authService.register(userData);
      ResponseUtil.successResponse(res, result);
    } catch (error: any) {
      if (error instanceof CustomException) {
        ResponseUtil.customErrorResponse(res, error);
      } else {
        ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
      }
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 1 * 60 * 60 * 1000,
      });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 2 * 60 * 60 * 1000,
      });

      ResponseUtil.successResponse(res, {
        message: 'Login success',
        user: result.user,
        token: result.token, // Also send token in response for localStorage
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      if (error instanceof CustomException) {
        ResponseUtil.customErrorResponse(res, error);
      } else {
        ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
      }
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Retrieve the refresh token from HTTP‑only cookies.
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res
          .status(400)
          .send({ message: 'No refresh token provided in cookies.' });
        return;
      }

      // Call the service layer to revoke the refresh token.
      await authService.logout();

      // Clear the authentication cookies.
      res.clearCookie('token', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });

      res.status(200).send({ message: 'Logged out successfully.' });
    } catch (err: any) {
      logger.error(err.message);
      res.status(500).send({ message: 'Logout failed.' });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Extract the refresh token from HTTP‑only cookies
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        ResponseUtil.errorResponse(
          res,
          CustomException.INVALID_TOKEN,
          'No refresh token provided in cookies.',
        );
        return;
      }

      // Call the service layer to refresh the token
      const result = await authService.refreshToken();

      // Set the new tokens in HTTP‑only cookies
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure flag in production
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Adjust sameSite attribute as needed
        path: '/',
        maxAge: 1 * 60 * 60 * 1000,
      });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 2 * 60 * 60 * 1000,
      });

      ResponseUtil.successResponse(res, {
        message: 'Token refreshed successfully.',
        token: result.token,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      if (error instanceof CustomException) {
        ResponseUtil.customErrorResponse(res, error);
      } else {
        ResponseUtil.errorResponse(res, CustomException.UNKNOWN, error.message);
      }
    }
  }

  static async validateToken(req: AuthRequest, res: Response): Promise<void> {
    ResponseUtil.successResponse(res, {
      message: 'Token is valid',
      user: req.user,
    });
  }
}

import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };

    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    details?: any[] | undefined,
    code?: string | undefined,
  ): void {
    const errorObj: ApiResponse['error'] = {
      message,
    };

    if (details !== undefined) {
      errorObj.details = details;
    }

    if (code !== undefined) {
      errorObj.code = code;
    }

    const response: ApiResponse = {
      success: false,
      error: errorObj,
    };

    res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
  ): void {
    this.success(res, data, message, 201);
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = 'Data retrieved successfully',
  ): void {
    const response: ApiResponse<{
      data: T[];
      pagination: typeof pagination;
    }> = {
      success: true,
      data: {
        data,
        pagination,
      },
      message,
    };

    res.status(200).json(response);
  }

  static validationError(
    res: Response,
    message: string = 'Validation failed',
    details?: any[] | undefined,
  ): void {
    this.error(res, message, 400, details, 'VALIDATION_ERROR');
  }

  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404, undefined, 'NOT_FOUND_ERROR');
  }

  static unauthorized(
    res: Response,
    message: string = 'Authentication required',
  ): void {
    this.error(res, message, 401, undefined, 'AUTHENTICATION_ERROR');
  }

  static forbidden(res: Response, message: string = 'Access denied'): void {
    this.error(res, message, 403, undefined, 'AUTHORIZATION_ERROR');
  }

  static conflict(res: Response, message: string = 'Resource conflict'): void {
    this.error(res, message, 409, undefined, 'CONFLICT_ERROR');
  }

  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests',
  ): void {
    this.error(res, message, 429, undefined, 'RATE_LIMIT_ERROR');
  }

  static internalServerError(
    res: Response,
    message: string = 'Internal server error',
  ): void {
    this.error(res, message, 500, undefined, 'INTERNAL_SERVER_ERROR');
  }
}

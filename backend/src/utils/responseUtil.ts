import { Response } from 'express';
import { CustomException } from '../exception/CustomException';

export interface SuccessResponseDto {
  success: boolean;
  data: any;
  message?: string;
}

export interface ErrorResponseDto {
  success: boolean;
  errorCode?: number;
  message: string;
  error?: string;
}

export class ResponseUtil {
  static successResponse(res: Response, data: any, message?: string) {
    const response: SuccessResponseDto = {
      success: true,
      data,
      message,
    };
    console.log(
      `[${new Date().toISOString()}] ${res.req?.method || 'UNKNOWN'} ${
        res.req?.originalUrl || 'UNKNOWN'
      } - SUCCESS`,
    );
    res.status(200).json(response);
  }

  static errorResponse(
    res: Response,
    errorCode: number,
    message: string,
    status: number = 500,
  ) {
    const response: ErrorResponseDto = {
      success: false,
      errorCode,
      message,
    };
    console.error(
      `[${new Date().toISOString()}] ${res.req?.method || 'UNKNOWN'} ${
        res.req?.originalUrl || 'UNKNOWN'
      } - FAILED: ${message}`,
    );
    res.status(status).json(response);
  }

  static customErrorResponse(res: Response, ex: CustomException) {
    const response: ErrorResponseDto = {
      success: false,
      errorCode: ex.errorCode,
      message: ex.message,
    };
    console.error(
      `[${new Date().toISOString()}] ${res.req?.method || 'UNKNOWN'} ${
        res.req?.originalUrl || 'UNKNOWN'
      } - FAILED: ${ex.message}`,
    );
    res.status(ex.statusCode).json(response);
  }

  static validationErrorResponse(res: Response, error: string) {
    const response: ErrorResponseDto = {
      success: false,
      errorCode: 400,
      message: 'Validation errors occurred',
      error,
    };
    console.warn(
      `[${new Date().toISOString()}] ${res.req?.method || 'UNKNOWN'} ${
        res.req?.originalUrl || 'UNKNOWN'
      } - VALIDATION FAILED: ${error}`,
    );
    res.status(400).json(response);
  }
}

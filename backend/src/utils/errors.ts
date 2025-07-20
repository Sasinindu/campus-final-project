export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string | undefined;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string | undefined,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public details?: any[] | undefined;

  constructor(message: string, details?: any[] | undefined) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

// Error codes for specific business logic
export const ErrorCodes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  DUPLICATE_USERNAME: 'DUPLICATE_USERNAME',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_PATIENT_ID: 'DUPLICATE_PATIENT_ID',
  INVALID_ROLE: 'INVALID_ROLE',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_METRIC_TYPE: 'INVALID_METRIC_TYPE',
  INVALID_PREDICTION_TYPE: 'INVALID_PREDICTION_TYPE',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
} as const;

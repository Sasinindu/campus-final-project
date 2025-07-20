export class CustomException extends Error {
  errorCode: number;
  statusCode: number;

  static readonly ALREADY_EXISTS = 1;
  static readonly DOES_NOT_EXIST = 2;
  static readonly AUTHENTICATION_FAILED = 3;
  static readonly AUTHORIZATION_FAILED = 4;
  static readonly INVALID_INPUT_EXCEPTION = 6;
  static readonly INVALID_TOKEN = 9;
  static readonly UNKNOWN = 100;

  constructor(
    message: string,
    errorCode: number = 0,
    statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AlreadyExistException extends CustomException {
  constructor(message: string = 'Already Exist') {
    super(message, CustomException.ALREADY_EXISTS);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DoesNotExistException extends CustomException {
  constructor(message: string = 'Does Not Exist') {
    super(message, CustomException.DOES_NOT_EXIST);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationFailedException extends CustomException {
  constructor(message: string = 'Request authentication failed.') {
    super(message, CustomException.AUTHENTICATION_FAILED, 401);
    Object.setPrototypeOf(this, new.target.prototype);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthorizationFailedException extends CustomException {
  constructor(message: string = 'Request authorization failed.') {
    super(message, CustomException.AUTHORIZATION_FAILED, 401);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidInputException extends CustomException {
  constructor(message: string = 'Invalid input') {
    super(message, CustomException.INVALID_INPUT_EXCEPTION);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnknownException extends CustomException {
  constructor(message: string = 'Unknown Exception') {
    super(message, CustomException.UNKNOWN);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

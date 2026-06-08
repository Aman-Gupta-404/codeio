export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errors: string[] = [],
  ) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", errors: string[] = []) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409);
  }

  static internal(message = "Internal Server Error") {
    return new AppError(message, 500);
  }

  static custom(message = "Internal Server Error", statusCode = 500) {
    return new AppError(message, statusCode);
  }
}

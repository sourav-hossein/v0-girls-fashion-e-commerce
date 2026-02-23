export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'UNKNOWN_ERROR'
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    if (error.message.includes('Unauthorized')) {
      return new UnauthorizedError(error.message)
    }
    if (error.message.includes('Forbidden')) {
      return new ForbiddenError(error.message)
    }
    if (error.message.includes('Not found')) {
      return new NotFoundError(error.message)
    }
    return new AppError(500, error.message, 'INTERNAL_ERROR')
  }

  return new AppError(500, 'An unknown error occurred', 'INTERNAL_ERROR')
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}

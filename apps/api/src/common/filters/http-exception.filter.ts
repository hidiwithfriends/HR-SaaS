import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // If the exception response already has our custom format, use it
    if (
      typeof exceptionResponse === 'object' &&
      'success' in exceptionResponse
    ) {
      return response.status(status).json(exceptionResponse);
    }

    // Handle validation errors from class-validator
    if (exception instanceof BadRequestException) {
      const responseBody: any = exceptionResponse;

      // Check if this is a validation error
      if (
        typeof responseBody === 'object' &&
        Array.isArray(responseBody.message)
      ) {
        return response.status(status).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: responseBody.message,
          },
        });
      }
    }

    // Default error format
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'An error occurred';

    return response.status(status).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: message,
      },
    });
  }
}

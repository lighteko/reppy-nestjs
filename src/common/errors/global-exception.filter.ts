import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '@/common/errors/domain-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof DomainError) {
      return response.status(exception.statusCode).json({
        message: exception.message,
        code: exception.code,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response.status(status).json(res);
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
}

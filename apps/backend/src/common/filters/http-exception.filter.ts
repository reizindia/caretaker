import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

const DATABASE_ERROR_CODES = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1008', 'P1010', 'P1011', 'P1012', 'P1013', 'P1017']);

function isDatabaseConnectionError(exception: any) {
  const message = String(exception?.message || '');
  return DATABASE_ERROR_CODES.has(exception?.code) ||
    message.includes("Can't reach database server") ||
    message.includes('Timed out fetching a new connection') ||
    message.includes('Error opening a TLS connection') ||
    message.includes('Connection refused');
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || message;
    } else if (isDatabaseConnectionError(exception)) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database not connected. Please check the live database connection.';
    } else if ((exception as any)?.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      message = 'A record with this value already exists';
    } else if ((exception as any)?.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Record not found';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

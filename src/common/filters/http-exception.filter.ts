import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const payload = exception.getResponse() as any;
    const message = typeof payload === 'string' ? payload : Array.isArray(payload?.message) ? payload.message : payload.message ?? exception.message;

    const errors = payload?.errors ?? payload?.error ?? null;

    response.status(status).json({
      status: 'error',
      code: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: null,
      ...errors ? { errors } : {},
    });
  }
}

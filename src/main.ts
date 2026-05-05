import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeader: [
      'Content-type',
      'Authorization',
      'authorization',
      'x-api-Key',
      'X-Api-Key',
      'x-amz-date',
      'x-amz-security-token',
    ]
  });
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }]
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${process.env.PORT ?? 3000}`);
}
bootstrap();

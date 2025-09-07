import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './all-exceptions-filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Job Board Platform API')
    .setDescription(
      `
API documentation for the Job Board Platform.
This platform connects job seekers and employers with role-based access.

#### Authentication

Protected endpoints use an **HttpOnly** cookie named \`Authentication\`.
To test these endpoints from Swagger UI, you must first log into the main web app in the **same browser** and keep the session active.
Swagger itself cannot set this cookie because it is HttpOnly.

#### Note

The \`POST /auth/login\` endpoint is not directly testable via Swagger
because it uses Passport Local Strategy for authentication.
Please log in through the main web app or Postman.
    `,
    )
    .setVersion('1.0.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, documentFactory);

  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //removes all properties that aren't in the DTO
      transform: true,
    }),
  );
  app.use(cookieParser());
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}

bootstrap();

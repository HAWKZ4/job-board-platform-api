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
      'API documentation for the Job Board Platform. This platform connects job seekers and employers with role-based access.',
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Jobs', 'Job creation and listing')
    .addTag('Profiles', 'User profile and resumes')
    .addTag('Applications', 'Applications management')
    .addTag('AdminUsers', 'User management and roles')
    .addTag('AdminApplications', 'Applications management')
    .addTag('AdminJobs', 'Jobs management')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //removes all properties that aren't in the DTO
      transform: true,
    }),
  );
  app.use(cookieParser());
  const port = configService.getOrThrow<number>('PORT') || 3000;
  await app.listen(port);
}

bootstrap();

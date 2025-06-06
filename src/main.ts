import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ensureUploadDirsExists } from './utils/ensure-upload-dirs.util';

async function bootstrap() {
  // Create upload directories before app starts
  ensureUploadDirsExists();
  const app = await NestFactory.create(AppModule);
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

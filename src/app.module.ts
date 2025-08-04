import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { APP_GUARD } from '@nestjs/core';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes it available everywhere
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // 1sec
          limit: 3, // 3req
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 20,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    JobsModule,
    ApplicationsModule,
    AuthModule,
    ProfilesModule,
    JobsModule,
    ApplicationsModule,
    MyLoggerModule,
    AdminModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

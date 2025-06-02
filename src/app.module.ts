import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true, // makes it available everywhere
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: parseInt(configService.get('DATABASE_PORT') || '5432', 10),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User],
        autoLoadEntities: true,
        synchronize: configService.getOrThrow('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,

    ProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [UsersModule, AuthModule, MulterModule.register()],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}

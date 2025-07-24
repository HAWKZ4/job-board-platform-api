import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { JobsModule } from 'src/jobs/jobs.module';
import { UsersModule } from 'src/users/users.module';
import { AdminApplicationsController } from './admin-applications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Application]), JobsModule, UsersModule],
  providers: [ApplicationsService],
  controllers: [ApplicationsController, AdminApplicationsController],
})
export class ApplicationsModule {}

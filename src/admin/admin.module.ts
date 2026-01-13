import { Module } from '@nestjs/common';
import { AdminJobsController } from './admin-jobs.controller';
import { AdminApplicationsController } from './admin-applications.controller';
import { JobsModule } from 'src/jobs/jobs.module';
import { ApplicationsModule } from 'src/applications/applications.module';
import { AdminUsersController } from './admin-users.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [JobsModule, ApplicationsModule, UsersModule],
  controllers: [
    AdminJobsController,
    AdminApplicationsController,
    AdminUsersController,
  ],
})
export class AdminModule {}

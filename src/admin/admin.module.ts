import { Module } from '@nestjs/common';
import { AdminJobsController } from './jobs/admin-jobs.controller';
import { AdminApplicationsController } from './applications/admin-applications.controller';
import { JobsModule } from 'src/jobs/jobs.module';
import { ApplicationsModule } from 'src/applications/applications.module';
import { AdminUsersController } from './users/admin-users.controller';
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

import { Module } from '@nestjs/common';
import { AdminJobsController } from './admin-jobs.controller';
import { AdminApplicationsController } from './admin-applications.controller';
import { JobsModule } from 'src/jobs/jobs.module';
import { ApplicationsModule } from 'src/applications/applications.module';

@Module({
  imports: [JobsModule, ApplicationsModule],
  controllers: [AdminJobsController, AdminApplicationsController],
})
export class AdminModule {}

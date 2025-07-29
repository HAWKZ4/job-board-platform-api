import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entites/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [TypeOrmModule,JobsService],
})
export class JobsModule {}

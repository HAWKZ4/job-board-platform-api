import { Controller, Get, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Job } from './entites/job.entity';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getAllJobs(
    @Query() pagiantionDto: PaginationDto,
  ): Promise<PaginatedResult<Job>> {
    return this.jobsService.findAll(pagiantionDto);
  }
}

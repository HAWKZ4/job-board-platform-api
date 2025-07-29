import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PublicJobDto } from './dtos/public-job.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getAllJobs(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Pagination<PublicJobDto>> {
    return this.jobsService.findAllByUser(paginationQueryDto);
  }

  @Serialize(PublicJobDto)
  @Get('/:id')
  async getJobById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicJobDto> {
    return this.jobsService.findJobByIdForUser(id);
  }
}

import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { UserJobDto } from './dtos/user-job.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedUserJobsResponseDto } from './dtos/paginated-user-response-jobs.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Get paginated list of published jobs (user)' })
  @ApiOkResponse({
    description: 'Paginated list of published jobs available to users',
    type: PaginatedUserJobsResponseDto,
  })
  @Get()
  async getAllJobs(@Query() query: PaginationQueryDto) {
    return this.jobsService.findAllJobsForUser(query);
  }

  @ApiOperation({ summary: 'Get a specific job by ID (user)' })
  @ApiOkResponse({
    description: 'Detailed info about the job available to users',
    type: UserJobDto,
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  @Serialize(UserJobDto)
  @Get('/:id')
  async getJobById(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findJobForUser(id);
  }
}

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { UserJobDto } from './dtos/user-job.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginatedUserJobsResponseDto } from './dtos/paginated-user-response-jobs.dto';
import { UserJobResponseDto } from './dtos/user-job-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Get paginated list of published jobs (user)' })
  @ApiOkResponse({
    description: 'Paginated list of published jobs available to users',
    type: PaginatedUserJobsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @Serialize(UserJobDto)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllJobs(
    @Query() query: PaginationQueryDto,
    @Req() req: any,
  ): Promise<Pagination<UserJobDto>> {
    const jobs = await this.jobsService.findAllByUser(query);
    req.customMessage = 'Jobs retrieved successfully';
    return jobs;
  }

  @ApiOperation({ summary: 'Get a specific job by ID (user)' })
  @ApiOkResponse({
    description: 'Detailed info about the job available to users',
    type: UserJobResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  @Serialize(UserJobDto)
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getJobById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<UserJobDto> {
    const job = await this.jobsService.findOneForUser(id);
    req.customMessage = 'Job retrieved successfully';
    return job;
  }
}

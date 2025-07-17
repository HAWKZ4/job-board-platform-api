import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Job } from './entites/job.entity';
import { CreateJobDto } from './dtos/create-job.dto';
import { PublicJobDto } from './dtos/public-job.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AdminJobDto } from './dtos/admin-job.dto';

@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Serialize(AdminJobDto)
  @Get()
  async getAllJobs(
    @Query() pagiantionDto: PaginationDto,
  ): Promise<PaginatedResult<AdminJobDto>> {
    return this.jobsService.findAll(pagiantionDto);
  }

  @Serialize(AdminJobDto)
  @Get('/:id')
  async getJobById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminJobDto> {
    return this.jobsService.findOneByIdForAdmin(id);
  }

  @Post()
  async createJob(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobsService.create(createJobDto);
  }
}

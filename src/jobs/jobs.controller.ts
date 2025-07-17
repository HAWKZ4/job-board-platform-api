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
import { PublicJobDto } from './dtos/public-job.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Serialize(PublicJobDto)
  @Get()
  async getAllJobs(
    @Query() pagiantionDto: PaginationDto,
  ): Promise<PaginatedResult<PublicJobDto>> {
    return this.jobsService.findAllByUsers(pagiantionDto);
  }

  @Serialize(PublicJobDto)
  @Get('/:id')
  async getJobById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicJobDto> {
    return this.jobsService.findJobByIdForUser(id);
  }
}

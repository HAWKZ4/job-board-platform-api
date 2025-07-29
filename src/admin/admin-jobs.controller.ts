import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { CreateJobDto } from '../jobs/dtos/create-job.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AdminJobDto } from './dtos/admin-job.dto';
import { UpdateJobDto } from '../jobs/dtos/update-jobs.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { AdminJobQueryDto } from './dtos/admin-job-query.dto';

@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllJobs(
    @Query() query: AdminJobQueryDto,
  ): Promise<Pagination<AdminJobDto>> {
    return this.jobsService.findAllByAdmin(query);
  }

  @Serialize(AdminJobDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  async getJobById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminJobDto> {
    return this.jobsService.findOneByIdForAdmin(id);
  }

  @Serialize(AdminJobDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createJob(@Body() dto: CreateJobDto): Promise<AdminJobDto> {
    return this.jobsService.create(dto);
  }

  @Serialize(AdminJobDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id')
  async updateJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto,
  ): Promise<AdminJobDto> {
    const updatedJob = await this.jobsService.update(id, dto);
    return updatedJob;
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/restore/:id')
  async restoreJob(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.jobsService.restore(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  @Delete('/:id')
  async deleteJob(
    @Param('id', ParseIntPipe) id: number,
    @Query('force') force?: 'true' | 'false',
  ): Promise<void> {
    const isForceDelete = force === 'true';
    return this.jobsService.delete(id, isForceDelete);
  }
}

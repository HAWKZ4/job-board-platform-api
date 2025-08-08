import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from '../../jobs/jobs.service';
import { CreateJobDto } from '../../jobs/dtos/create-job.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AdminJobDto } from './../dtos/jobs/admin-job.dto';
import { UpdateJobDto } from '../../jobs/dtos/update-job.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { AdminJobQueryDto } from './../dtos/jobs/admin-job-query.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginatedAdminJobsResponseDto } from '../dtos/jobs/paginated-admin-jobs-response.dto';
import { AdminJobResponseDto } from '../dtos/jobs/admin-job-response.dto';

@ApiTags('Admin Jobs')
@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Get all jobs (admin only)' })
  @ApiOkResponse({
    description: 'List of jobs fetched successfully with pagination metadata',
    type: PaginatedAdminJobsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllJobs(
    @Query() query: AdminJobQueryDto,
    @Req() req: any,
  ): Promise<Pagination<AdminJobDto>> {
    const jobs = await this.jobsService.findAllByAdmin(query);
    req.customMessage = 'Jobs retrieved successfully';
    return jobs;
  }

  @ApiOperation({ summary: 'Get a job by id (admin only)' })
  @ApiOkResponse({
    description: 'Job with the specified ID was retrieved successfully',
    type: AdminJobResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  @Serialize(AdminJobDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  async getJobById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<AdminJobDto> {
    const job = await this.jobsService.findOneByIdForAdmin(id);
    req.customMessage = 'Job retrieved successfully';
    return job;
  }

  @ApiOperation({ summary: 'Create a new job (admin only)' })
  @ApiCreatedResponse({
    description: 'Job created successfully',
    type: AdminJobResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Serialize(AdminJobDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createJob(
    @Body() dto: CreateJobDto,
    @Req() req: any,
  ): Promise<AdminJobDto> {
    const job = await this.jobsService.create(dto);
    req.customMessage = 'Job created successfully';
    return job;
  }

  @ApiOperation({ summary: 'Update an existing job (admin only)' })
  @ApiOkResponse({
    description: 'Job updated successfully',
    type: AdminJobResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  @Serialize(AdminJobDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id')
  async updateJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto,
    @Req() req: any,
  ): Promise<AdminJobDto> {
    const updatedJob = await this.jobsService.update(id, dto);
    req.customMessage = 'Job updated successfully';
    return updatedJob;
  }

  @ApiOperation({ summary: 'Delete a job by ID (soft or hard delete)' })
  @ApiQuery({
    name: 'force',
    required: false,
    enum: ['true', 'false'],
    description: 'Set to true to force delete the job (hard delete)',
  })
  @ApiOkResponse({
    description:
      'Job was deleted successfully (soft or hard depending on query param)',
    example: {
      statusCode: 200,
      message: 'Job hard/soft deleted successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  async deleteJob(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Query('force') force?: 'true' | 'false',
  ): Promise<void> {
    const isForceDelete = force === 'true';
    await this.jobsService.delete(id, isForceDelete);
    req.customMessage = isForceDelete
      ? 'Job force deleted successfully'
      : 'Job soft deleted successfully';
  }

  @ApiOperation({
    summary: 'Restore a previously soft-deleted job (admin only)',
  })
  @ApiOkResponse({
    description: 'Job restored successfully',
    example: {
      statusCode: 200,
      message: 'Job restored successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/restore/:id')
  async restoreJob(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<void> {
    await this.jobsService.restore(id);
    req.customMessage = 'Job restored successfully';
  }
}

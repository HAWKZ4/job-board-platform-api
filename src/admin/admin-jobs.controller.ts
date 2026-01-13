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
import { AdminJobDto } from './dtos/jobs/admin-job.dto';
import { UpdateJobDto } from '../jobs/dtos/update-job.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminJobQueryDto } from './dtos/jobs/admin-job-query.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginatedAdminJobsResponseDto } from './dtos/jobs/paginated-admin-jobs-response.dto';
import { AdminSingleJobQueryDto } from './dtos/jobs/admin-single-job-query.dto';

@ApiTags('Admin Jobs')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Get()
  async getAllJobs(@Query() query: AdminJobQueryDto) {
    return this.jobsService.findAllForAdmin(query);
  }

  @ApiOperation({ summary: 'Get a job by id (admin only)' })
  @ApiOkResponse({
    description: 'Job with the specified ID was retrieved successfully',
    type: AdminJobDto,
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
  @Get('/:id')
  async getJobById(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: AdminSingleJobQueryDto,
  ) {
    return this.jobsService.findOneForAdmin(id, query);
  }

  @ApiOperation({ summary: 'Create a new job (admin only)' })
  @ApiCreatedResponse({
    description: 'Job created successfully',
    type: AdminJobDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Post()
  async createJob(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @ApiOperation({ summary: 'Update an existing job (admin only)' })
  @ApiOkResponse({
    description: 'Job updated successfully',
    type: AdminJobDto,
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
  @Patch('/:id')
  async updateJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto,
  ) {
    const updatedJob = await this.jobsService.update(id, dto);
    return updatedJob;
  }

  @ApiOperation({ summary: 'Delete a job by ID (soft delete)' })
  @ApiNoContentResponse({
    description: 'Job was deleted successfully.',
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
  @HttpCode(204)
  @Delete('/:id')
  async deleteJob(@Param('id', ParseIntPipe) id: number) {
    await this.jobsService.softDeleteForAdmin(id);
  }

  @ApiOperation({
    summary: 'Restore a previously soft-deleted job (admin only)',
  })
  @ApiOkResponse({
    description: 'Job restored successfully',
    example: {
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
  @Patch('/restore/:id')
  async restoreJob(@Param('id', ParseIntPipe) id: number) {
    await this.jobsService.restoreForAdmin(id);
    return { message: 'Job restored successfully' };
  }
}

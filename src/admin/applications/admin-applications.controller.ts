import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from '../../applications/applications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AdminApplicationDto } from '../dtos/applications/admin-application.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateApplicationStatusDto } from '../../applications/dtos/update-application-status.dto';
import { AdminApplicationQueryDto } from '../dtos/applications/admin-application-query.dto';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginatedAdminApplicationsResponseDto } from '../dtos/applications/paginated-admin-applications-response.dto';
import { AdminSingleApplicationQueryDto } from '../dtos/applications/admin-single-application-query.dto';

@ApiTags('Admin Applications')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/applications')
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @ApiOperation({ summary: 'Get all applications (admin only)' })
  @ApiOkResponse({
    description:
      'List of applications fetched successfully with pagination metadata',
    type: PaginatedAdminApplicationsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Get()
  async getAllApplications(@Query() query: AdminApplicationQueryDto) {
    return this.applicationsService.findAllApplicationsForAdmin(query);
  }

  @ApiOperation({ summary: 'Get an application by ID (admin only)' })
  @ApiOkResponse({
    description: 'Application with the specified ID was retrieved successfully',
    type: AdminApplicationDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Application not found',
  })
  @Serialize(AdminApplicationDto)
  @Get('/:id')
  async getApplicationById(
    @Param('id', ParseIntPipe) id: number,
    @Query() query?: AdminSingleApplicationQueryDto,
  ) {
    return this.applicationsService.findApplicationForAdmin(id, query);
  }

  @ApiOperation({
    summary: 'Update an existing application status (admin only)',
  })
  @ApiOkResponse({
    description: 'Application status updated successfully',
    type: AdminApplicationDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'Application not found',
  })
  @Serialize(AdminApplicationDto)
  @Patch('/:id')
  async updateApplicationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateApplicationStatus(id, dto);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
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
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginatedAdminApplicationsResponseDto } from '../dtos/applications/paginated-admin-applications-response';
import { AdminApplicationResponseDto } from '../dtos/applications/admin-application-response.dto';

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
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllApplicationcs(
    @Query() query: AdminApplicationQueryDto,
    @Req() req: any,
  ): Promise<Pagination<AdminApplicationDto>> {
    const applications =
      this.applicationsService.findAllApplicationsForAdmin(query);
    req.customMessage = 'Applications fetched successfully';
    return applications;
  }

  @ApiOperation({ summary: 'Get an application by ID (admin only)' })
  @ApiOkResponse({
    description: 'Application with the specified ID was retrieved successfully',
    type: AdminApplicationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Serialize(AdminApplicationDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  async getApplication(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<AdminApplicationDto> {
    const application = this.applicationsService.findOneByAdmin(id);
    req.customMessage = 'Application retrieved successfully';
    return application;
  }

  @ApiOperation({
    summary: 'Update an existing application status (admin only)',
  })
  @ApiOkResponse({
    description: 'Application status updated successfully',
    example: {
      statusCode: 200,
      message: 'Application status updated successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Serialize(AdminApplicationDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id')
  async updateApplicationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req: any,
  ): Promise<AdminApplicationDto> {
    const updatedApplication = this.applicationsService.updateStatus(id, dto);
    req.customMessage = 'Application updated successfully';
    return updatedApplication;
  }
}

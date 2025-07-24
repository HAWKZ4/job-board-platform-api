import { PaginatedResult } from './../common/interfaces/paginated-result.interface';
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
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { AdminApplicationDto } from './dtos/admin-application.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateApplicationStatusDto } from './dtos/update-application-status.dto';

@Controller('/admin/applications')
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Serialize(AdminApplicationDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllApplicationcs(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<AdminApplicationDto>> {
    return this.applicationsService.findAllApplicationsForAdmin(paginationDto);
  }

  @Serialize(AdminApplicationDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  async getApplication(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminApplicationDto> {
    return this.applicationsService.getApplicationByAdmin(id);
  }

  @Serialize(AdminApplicationDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id')
  async updateApplicationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
  ): Promise<AdminApplicationDto> {
    return this.applicationsService.updateApplicationStatus(
      id,
      updateApplicationStatusDto,
    );
  }
}

import { PaginatedResult } from './../common/interfaces/paginated-result.interface';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserApplicationDto } from './dtos/user-application.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { AdminApplicationDto } from './dtos/admin-application.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

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
    return this.applicationsService.findAllApplicationsForAdmin(paginationDto) ;
  }
}

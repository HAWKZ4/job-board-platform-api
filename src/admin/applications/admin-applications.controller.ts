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
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('admin/applications')
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllApplicationcs(
    @Query() query: AdminApplicationQueryDto,
  ): Promise<Pagination<AdminApplicationDto>> {
    return this.applicationsService.findAllApplicationsForAdmin(query);
  }

  @Serialize(AdminApplicationDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  async getApplication(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminApplicationDto> {
    return this.applicationsService.findOneByAdmin(id);
  }

  @Serialize(AdminApplicationDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id')
  async updateApplicationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationStatusDto,
  ): Promise<AdminApplicationDto> {
    return this.applicationsService.updateStatus(id, dto);
  }
}

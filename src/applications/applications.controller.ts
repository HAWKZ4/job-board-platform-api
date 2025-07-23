import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserApplicationDto } from './dtos/user-application.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Serialize(UserApplicationDto)
  @UseGuards(JwtAuthGuard)
  @Post()
  async applyToJob(
    @CurrentUser() user: SafeUser,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(createApplicationDto, user);
  }

  @Serialize(UserApplicationDto)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyApplications(
    @CurrentUser() user: SafeUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserApplicationDto>> {
    return this.applicationsService.findAllApplicationsForUser(
      paginationDto,
      user,
    );
  }

  @Serialize(UserApplicationDto)
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getApplication(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserApplicationDto> {
    return this.applicationsService.findOneApplicationForUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('/:id/withdraw')
  async withdrawApplication(
    @CurrentUser() user: SafeUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.applicationsService.withdraw(id, user);
  }
}

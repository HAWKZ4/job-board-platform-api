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
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  private readonly logger = new MyLoggerService(ApplicationsController.name);

  @Serialize(UserApplicationDto)
  @UseGuards(JwtAuthGuard)
  @Post()
  async applyToJob(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateApplicationDto,
  ) {
    this.logger.log(
      `User ${user.id} is applying to Job ${dto.jobId}`,
      ApplicationsService.name,
    );

    return this.applicationsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllMyApplications(
    @CurrentUser() user: SafeUser,
    @Query() query: PaginationQueryDto,
  ): Promise<Pagination<UserApplicationDto>> {
    return this.applicationsService.findAllMine(user, query);
  }

  @Serialize(UserApplicationDto)
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getApplication(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserApplicationDto> {
    return this.applicationsService.findOneByUser(id);
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

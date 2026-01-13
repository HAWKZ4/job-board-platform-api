import { UpdateApplicationStatusDto } from './dtos/update-application-status.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';
import { UserApplicationDto } from './dtos/user-application.dto';
import { paginateAndMap } from 'src/common/utils/pagination';
import { AdminApplicationQueryDto } from '../admin/dtos/applications/admin-application-query.dto';
import { AdminApplicationDto } from '../admin/dtos/applications/admin-application.dto';
import { UsersService } from 'src/users/users.service';
import { JobsService } from 'src/jobs/jobs.service';
import { AdminSingleApplicationQueryDto } from 'src/admin/dtos/applications/admin-single-application-query.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,

    private readonly jobsService: JobsService,

    private readonly usersService: UsersService,
  ) {}

  private readonly logger = new Logger(ApplicationsService.name);

  // User Methods
  async create(dto: CreateApplicationDto, id: number) {
    try {
      const { jobId, coverLetter } = dto;

      const user = await this.usersService.findOneById(id);

      if (!user.resumeUrl)
        throw new BadRequestException(
          'Please upload your resume before applying',
        );

      const job = await this.jobsService.findOneForUser(jobId);

      const exists = await this.appRepo.findOne({
        where: {
          user: { id: user.id },
          job: { id: job.id },
        },
      });

      if (exists)
        throw new ConflictException('You have already applied to this job');

      const application = this.appRepo.create({
        job,
        user,
        submittedResumePath: user.resumeUrl,
        coverLetter,
      });

      return await this.appRepo.save(application);
    } catch (error) {
      this.logger.error(`Error creating application: ${error.message}`);
      throw error;
    }
  }

  async findAll(user: SafeUser, dto: PaginationQueryDto) {
    const qb = this.appRepo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .where('application.userId = :userId', { userId: user.id })
      .andWhere('job.deletedAt IS NULL')
      .orderBy('application.createdAt', 'DESC');

    return paginateAndMap<Application, UserApplicationDto>(
      qb,
      dto,
      UserApplicationDto,
    );
  }

  async findOneForUser(id: number) {
    const application = await this.appRepo.findOne({
      where: { id },
      relations: {
        job: true,
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    return application;
  }

  async withdraw(applicationId: number, user: SafeUser) {
    const application = await this.appRepo.findOne({
      where: { id: applicationId, user: { id: user.id } },
    });

    if (!application) throw new NotFoundException('Application not found');

    if (application.deletedAt) {
      throw new ConflictException('Application already withdrawn');
    }

    this.logger.log(`User ${user.id} withdrew application ${applicationId}`);
    await this.appRepo.softDelete(application.id);
  }

  // Admin Methods
  async findAllForAdmin(dto: AdminApplicationQueryDto) {
    const { jobId, userId } = dto;

    const qb = this.appRepo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.user', 'user')
      .orderBy('application.createdAt', 'DESC');

    if (dto.showDeleted) {
      qb.withDeleted();
    }

    if (jobId) {
      qb.andWhere('application.jobId = :jobId', { jobId });
    }

    if (userId) {
      qb.andWhere('application.userId = :userId', { userId });
    }

    return paginateAndMap<Application, AdminApplicationDto>(
      qb,
      dto,
      AdminApplicationDto,
    );
  }

  private async findOneById(id: number, includeDeleted = false) {
    const application = await this.appRepo.findOne({
      where: {
        id,
      },
      withDeleted: includeDeleted,
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async findOneForAdmin(id: number, dto?: AdminSingleApplicationQueryDto) {
    return this.findOneById(id, dto?.showDeleted);
  }

  async updateStatus(id: number, dto: UpdateApplicationStatusDto) {
    const application = await this.findOneById(id);

    if (application.deletedAt) {
      throw new ConflictException('Cannot update deleted application');
    }

    application.status = dto.status;
    await this.appRepo.save(application);
    return this.findOneById(id);
  }
}

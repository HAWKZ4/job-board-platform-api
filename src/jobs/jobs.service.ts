import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entites/job.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-jobs.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { AdminJobDto } from '../admin/dtos/admin-job.dto';
import { paginateAndMap } from 'src/common/utils/pagination';
import { PublicJobDto } from './dtos/public-job.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { AdminJobQueryDto } from '../admin/dtos/admin-job-query.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
  ) {}

  // User-Methods
  async findAllByUser(
    dto: PaginationQueryDto,
  ): Promise<Pagination<PublicJobDto>> {
    const { page = 1, limit = 10 } = dto;

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .where('job.deletedAt IS NULL')
      .orderBy('job.createdAt', 'DESC');

    return paginateAndMap<Job, PublicJobDto>(
      qb,
      {
        page,
        limit,
      },
      AdminJobDto,
    );
  }

  async findOneForUser(id: number): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id, isPublished: true, deletedAt: IsNull() },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  // Admin-Methods
  async findAllByAdmin(
    dto: AdminJobQueryDto,
  ): Promise<Pagination<AdminJobDto>> {
    const { page = 1, limit = 10, showDeleted, company, location, title } = dto;

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .orderBy('job.createdAt', 'DESC');

    if (showDeleted === 'true') qb.withDeleted();

    if (company)
      qb.andWhere('job.comapny ILIKE company', { company: `%${company}%` });

    if (location) {
      qb.andWhere('job.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    if (title) {
      qb.andWhere('job.title ILIKE :title', { title: `%${title}%` });
    }

    return paginateAndMap<Job, AdminJobDto>(
      qb,
      {
        page,
        limit,
      },
      AdminJobDto,
    );
  }

  async findOneByIdForAdmin(id: number): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async create(dto: CreateJobDto): Promise<Job> {
    const newJob = this.jobRepo.create({ ...dto });
    return await this.jobRepo.save(newJob);
  }

  async update(id: number, dto: UpdateJobDto): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!job) throw new NotFoundException('Job not found');

    Object.assign(job, dto);
    const savedJob = await this.jobRepo.save(job);

    return savedJob;
  }

  async restore(id: number): Promise<void> {
    const result = await this.jobRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('Job not found or already active');
    }
  }

  async delete(id: number, force: boolean = false): Promise<void> {
    const job = await this.jobRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!job) throw new NotFoundException('Job not found');

    if (force) {
      await this.jobRepo.remove(job);
    } else {
      await this.jobRepo.softRemove(job);
    }
  }
}

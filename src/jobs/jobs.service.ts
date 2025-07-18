import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entites/job.entity';
import { IsNull, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-jobs.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
  ) {}

  // User-Methods
  async findAllByUser(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Job>> {
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 1;

    const [jobs, total] = await this.jobRepo.findAndCount({
      where: { deletedAt: IsNull(), isPublished: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findJobByIdForUser(id: number): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id, isPublished: true, deletedAt: IsNull() },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  // Admin-Methods
  async findAllByAdmin(
    paginationDto: PaginationDto,
    includeDeleted: boolean,
  ): Promise<PaginatedResult<Job>> {
    const { page = 1, limit = 10 } = paginationDto;
    const query = this.jobRepo.createQueryBuilder('job');

    if (includeDeleted) query.withDeleted();

    query
      .orderBy('job.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [jobs, total] = await query.getManyAndCount();

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOneByIdForAdmin(id: number): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const newJob = this.jobRepo.create({ ...createJobDto });
    return await this.jobRepo.save(newJob);
  }

  async update(id: number, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!job) throw new NotFoundException('Job not found');

    Object.assign(job, updateJobDto);
    const savedJob = await this.jobRepo.save(job);

    return savedJob;
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
      await this.jobRepo.softDelete(id);
    }
  }
}

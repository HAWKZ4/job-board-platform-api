import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { hash } from 'bcryptjs';
import { ChangePasswordDto } from 'src/profiles/dtos/change-password.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { UpdateProfileDto } from 'src/profiles/dtos/update-profile.dto';
import {
  UserWithCredentials,
  UserWithoutCredeitals,
} from '../common/types/user.types';
import { PublicProfile } from 'src/profiles/types/profile.types';
import { join } from 'path';
import { promises as fs } from 'fs';
import * as path from 'path';
import { RESUME_UPLOADS_DIR } from 'src/common/constatns/file-paths';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  // Your service method focuses on fetching and returning raw data (Entities).
  // It doesn’t worry about shaping the response or exposing only certain fields.
  // Also, you can shape your response easily without manually filtering the data everywhere.
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserWithoutCredeitals>> {
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 10;

    const [users, total] = await this.userRepo.findAndCount({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'location',
        'resumeUrl',
        'role',
        'createdAt',
        'updatedAt',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOneByEmail(email: string): Promise<UserWithoutCredeitals | null> {
    return this.userRepo.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'location',
        'resumeUrl',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findOneById(id: number): Promise<UserWithoutCredeitals | null> {
    return this.userRepo.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'location',
        'resumeUrl',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findOneForCredentials(
    criteria: { id?: number; email?: string },
    include: { password?: boolean; refreshToken?: boolean },
  ): Promise<UserWithCredentials | null> {
    const select: (keyof User)[] = ['id', 'email', 'role'];

    if (include.password) {
      select.push('password');
    }
    if (include.refreshToken) {
      select.push('refreshToken');
    }

    const query: FindOneOptions<User> = {
      where: criteria,
      select,
    };

    return this.userRepo.findOne(query);
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const existingUser = await this.findOneByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hash(createUserDto.password, 10);
    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const newUser = await this.userRepo.save(user);

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutCredeitals> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.validateEmail(updateUserDto.email, id);
    }
    Object.assign(user, updateUserDto);
    await this.userRepo.save(user);

    const updated = await this.findOneById(id);

    if (!updated)
      throw new InternalServerErrorException('Failed to fetch updated user');

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      role: updated.role,
      location: updated.location,
      resumeUrl: updated.resumeUrl,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async updateFromProfile(
    id: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<PublicProfile> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException('User not found');

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      await this.validateEmail(updateProfileDto.email, id);
    }

    Object.assign(user, updateProfileDto);

    await this.userRepo.save(user);

    const updated = await this.findOneById(id);

    if (!updated)
      throw new InternalServerErrorException('Failed to fetch updated user');

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      location: updated.location,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: number): Promise<boolean> {
    const user = await this.findOneById(id);
    if (user?.resumeUrl) {
      const fullPath = join(process.cwd(), user.resumeUrl);
      await fs.access(fullPath); // check if file exists, throws if not
      await fs.unlink(fullPath);
    }
    const result = await this.userRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const user = await this.findOneForCredentials(
      { id },
      { refreshToken: true },
    );
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    user.refreshToken = refreshToken;
    return this.userRepo.save(user);
  }

  async changePassword(
    user: UserWithCredentials,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const hashedPassword = await hash(dto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepo.save(user);
  }

  async updateResume(userId: number, resumeUrl: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Remove old resume if it exists
    if (user.resumeUrl) {
      const oldFilePath = path.join(
        RESUME_UPLOADS_DIR,
        path.basename(user.resumeUrl),
      );
      try {
        await fs.access(oldFilePath); // check if file exists, throws if not
        await fs.unlink(oldFilePath);
      } catch (err) {
        // Log error but don't fail the whole operation if deletion fails
        console.warn(
          `Failed to delete old resume at ${oldFilePath}:`,
          err.message,
        );
      }
    }

    user.resumeUrl = resumeUrl;
    await this.userRepo.save(user);
  }

  private async validateEmail(email: string, userId?: number): Promise<void> {
    const existingUser = await this.userRepo.findOne({ where: { email } });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Email already in use');
    }
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepo.update(userId, { refreshToken: null });
  }
}

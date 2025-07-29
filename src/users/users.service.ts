import { PaginationQueryDto } from './../common/dtos/pagination-query.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { hash } from 'bcryptjs';
import { ChangePasswordDto } from 'src/profiles/dtos/change-password.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/update-profile.dto';

import { join } from 'path';
import { promises as fs } from 'fs';
import * as path from 'path';
import { RESUME_UPLOADS_DIR } from 'src/common/constatns/file-paths';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserDto } from './dtos/user.dto';
import { paginateAndMap } from 'src/common/utils/pagination';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<Pagination<UserDto>> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC');

    return paginateAndMap<User, UserDto>(qb, paginationQueryDto, UserDto);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
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

    return newUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.validateEmail(updateUserDto.email, id);
    }
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepo.save(user);

    return updatedUser;
  }

  async updateFromProfile(
    id: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException('User not found');

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      await this.validateEmail(updateProfileDto.email, id);
    }

    Object.assign(user, updateProfileDto);

    const updatedProfile = await this.userRepo.save(user);

    return updatedProfile;
  }

  async delete(id: number, force: boolean = false): Promise<void> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException('User not found');

    if (user?.resumeUrl) {
      const fullPath = join(process.cwd(), user.resumeUrl);
      await fs.access(fullPath); // check if file exists, throws if not
      await fs.unlink(fullPath);
    }

    if (force) {
      await this.userRepo.remove(user);
    } else {
      await this.userRepo.softRemove(user);
    }
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    user.refreshToken = refreshToken;
    return this.userRepo.save(user);
  }

  async changePassword(user: User, dto: ChangePasswordDto): Promise<void> {
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

  async restore(id: number): Promise<void> {
    const result = await this.userRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('Job not found or already active');
    }
  }
}

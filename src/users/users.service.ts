import { AdminSingleUserQueryDto } from './../admin/dtos/users/admin-single-user-query.dto';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../admin/dtos/users/create-user.dto';
import { hash } from 'bcryptjs';
import { ChangePasswordDto } from 'src/profiles/dtos/change-password.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/update-profile.dto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { RESUME_UPLOADS_DIR } from 'src/common/constatns/file-paths';
import { UserDto } from '../common/dtos/user/user.dto';
import { paginateAndMap } from 'src/common/utils/pagination';
import { deleteFile } from 'utils/delete-file';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { AdminUserQueryDto } from 'src/admin/dtos/users/admin-user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async findAllUsers(dto: AdminUserQueryDto) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC');

    if (dto.showDeleted) {
      qb.withDeleted();
    }

    return paginateAndMap<User, UserDto>(qb, dto, UserDto);
  }

  private async findUser(
    where: { id?: number; email?: string },
    includeDeleted = false,
  ) {
    const user = await this.userRepo.findOne({
      where,
      withDeleted: includeDeleted,
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUserByEmail(email: string, dto?: AdminSingleUserQueryDto) {
    return this.findUser({ email }, dto?.showDeleted);
  }

  async findUserById(id: number, dto?: AdminSingleUserQueryDto) {
    return this.findUser({ id }, dto?.showDeleted);
  }

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await hash(dto.password, 10);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });

    try {
      return await this.userRepo.save(user);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }

  // Reusable logic
  private async updateUserFields(id: number, dto: Partial<User>) {
    const user = await this.findUserById(id);

    if (dto.email && dto.email !== user.email) {
      await this.validateEmail(dto.email, id);
    }

    Object.assign(user, dto);
    await this.userRepo.save(user);

    return this.findUserById(id);
  }

  async updateUserProfile(id: number, dto: UpdateProfileDto) {
    return this.updateUserFields(id, dto);
  }

  async deleteUser(id: number, currentUser?: SafeUser) {
    const user = await this.findUser({ id });

    if (currentUser && currentUser.id === user.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    if (user.resumeUrl) {
      await deleteFile(user.resumeUrl);
    }

    await this.userRepo.softDelete(id);
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const user = await this.findUserById(id);
    user.refreshToken = refreshToken;
    return this.userRepo.save(user);
  }

  async changePassword(user: User, dto: ChangePasswordDto) {
    const hashedPassword = await hash(dto.newPassword, 10);
    user.password = hashedPassword;
    return this.userRepo.save(user);
  }

  async updateUserResume(id: number, resumeUrl: string) {
    const user = await this.findUserById(id);

    if (user.resumeUrl) {
      const oldFilePath = path.join(
        RESUME_UPLOADS_DIR,
        path.basename(user.resumeUrl),
      );

      try {
        await fs.access(oldFilePath);
        await fs.unlink(oldFilePath);
      } catch (error) {
        this.logger.warn(
          `Failed to delete old resume at ${oldFilePath}`,
          error,
        );
      }
    }

    user.resumeUrl = resumeUrl;
    await this.userRepo.save(user);
  }

  private async validateEmail(email: string, userId: number) {
    // Check if user want to update own email with existing one
    const existing = await this.userRepo.findOne({ where: { email } });

    if (existing && existing.id !== userId) {
      throw new ConflictException('Email already in use');
    }
  }

  async clearRefreshToken(userId: number) {
    return this.userRepo.update(userId, { refreshToken: null });
  }

  async restoreUser(id: number) {
    const result = await this.userRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found or already active');
    }
  }
}

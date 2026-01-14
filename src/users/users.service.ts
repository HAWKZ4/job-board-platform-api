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
import { RESUME_UPLOADS_DIR } from 'src/common/constatns/file-paths';
import { UserDto } from '../common/dtos/user/user.dto';
import { paginateAndMap } from 'src/common/utils/pagination';
import { deleteFile } from 'utils/delete-file';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { AdminUserQueryDto } from 'src/admin/dtos/users/admin-user-query.dto';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  /* -------------------------------------------------------------------------- */
  /*                                  ADMIN                                     */
  /* -------------------------------------------------------------------------- */

  async getAllForAdmin(dto: AdminUserQueryDto) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.createdAt',
        'user.deletedAt',
      ])
      .orderBy('user.id', 'DESC');

    if (dto.showDeleted) qb.withDeleted();

    return paginateAndMap<User, UserDto>(qb, dto, UserDto);
  }

  async getUserForAdminById(id: number, showDeleted = false) {
    return this.getUserForAdmin({ id }, showDeleted);
  }

  async getUserForAdminByEmail(email: string, showDeleted = false) {
    return this.getUserForAdmin({ email }, showDeleted);
  }

  private async getUserForAdmin(
    where: { id?: number; email?: string },
    showDeleted = false,
  ) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.location',
        'user.role',
        'user.resumeUrl',
        'user.createdAt',
        'user.deletedAt',
      ])
      .where(where);

    if (showDeleted) qb.withDeleted();

    const user = await qb.getOne();
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  AUTH                                      */
  /* -------------------------------------------------------------------------- */

  /**
   * INTERNAL AUTH USE ONLY
   * Includes password + refreshToken
   * Never expose to controllers directly
   */

  async getUserWithSecretsByEmail(email: string) {
    return this.getUserWithSecrets({ email });
  }

  async getUserWithSecretsById(id: number) {
    return this.getUserWithSecrets({ id });
  }

  //***********//

  private async getUserWithSecrets(where: { id?: number; email?: string }) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.refreshToken'])
      .where(where)
      .getOne();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateRefreshToken(userId: number, token: string | null) {
    await this.userRepo.update(userId, { refreshToken: token });
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepo.update(userId, { refreshToken: null });
  }

  /* -------------------------------------------------------------------------- */
  /*                               PUBLIC / USER                                */
  /* -------------------------------------------------------------------------- */

  async getPublicUserById(id: number) {
    return this.getUserOrFail({ id });
  }

  async create(dto: CreateUserDto) {
    const user = this.userRepo.create({
      ...dto,
      password: await hash(dto.password, 10),
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

  async updateProfileFields(userId: number, dto: UpdateProfileDto) {
    const user = await this.getUserOrFail({ id: userId });

    if (dto.email && dto.email !== user.email) {
      await this.ensureEmailAvailable(dto.email, userId);
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async changePassword(user: User, newPassword: string) {
    user.password = await hash(newPassword, 10);
    return this.userRepo.save(user);
  }

  async updateResume(userId: number, resumeUrl: string) {
    const user = await this.getUserOrFail({ id: userId });

    if (user.resumeUrl) {
      try {
        await fs.unlink(
          path.join(RESUME_UPLOADS_DIR, path.basename(user.resumeUrl)),
        );
      } catch {
        this.logger.warn('Failed to delete old resume');
      }
    }

    user.resumeUrl = resumeUrl;
    await this.userRepo.save(user);
  }

  async softDelete(userId: number, currentUser?: SafeUser) {
    const user = await this.getUserOrFail({ id: userId });

    if (currentUser?.id === user.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    if (user.resumeUrl) await deleteFile(user.resumeUrl);
    await this.userRepo.softDelete(userId);
  }

  async restoreByAdmin(userId: number) {
    const result = await this.userRepo.restore(userId);
    if (!result.affected) {
      throw new NotFoundException('User not found or already active');
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              INTERNAL BASE                                 */
  /* -------------------------------------------------------------------------- */

  private async getUserOrFail(
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

  private async ensureEmailAvailable(email: string, userId: number) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing && existing.id !== userId) {
      throw new ConflictException('Email already in use');
    }
  }
}

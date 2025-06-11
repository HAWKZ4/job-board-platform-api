import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { AdminUpdateUserDto } from './dtos/admin-update-user.dto';
import { hash } from 'bcryptjs';
import { ChangePasswordDto } from 'src/profiles/dtos/change-password.dto';

@Injectable()
export class UsersService {
  private async findUserOrThrow(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.find();
  }

  async getUser(query: { id?: number; email?: string }): Promise<User> {
    if (!query.id && !query.email) {
      throw new BadRequestException('Must provide either id or email');
    }
    const user = await this.userRepo.findOne({ where: query });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hash(createUserDto.password, 10);
    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepo.save(user);
  }

  async adminUpdateUser(
    id: number,
    adminupdateUserDto: AdminUpdateUserDto,
  ): Promise<User> {
    const user = await this.findUserOrThrow(id);

    if (adminupdateUserDto.email && adminupdateUserDto.email !== user.email) {
      await this.validateEmail(adminupdateUserDto.email, id);
    }
    Object.assign(user, adminupdateUserDto);
    return this.userRepo.save(user);
  }
  // TODO:
  // async updateOwnProfile( 
  //   id: number,
  //   updateUserDto: UpdateUserDto,
  // ): Promise<User> {
  //   const user = await this.findUserOrThrow(id);

  //   if (updateUserDto.email && updateUserDto.email !== user.email) {
  //     await this.validateEmail(updateUserDto.email, id);
  //   }

  //   Object.assign(user, updateUserDto);
  //   return this.userRepo.save(user);
  // }

  async deleteUser(id: number): Promise<void> {
    const user = await this.findUserOrThrow(id);
    await this.userRepo.remove(user);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.findUserOrThrow(userId);
    user.refreshToken = refreshToken;
    return this.userRepo.save(user);
  }

  async changePassword(user: User, dto: ChangePasswordDto) {
    const hashedPassword = await hash(dto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepo.save(user);
  }

  private async validateEmail(
    email: string,
    currentUserId?: number,
  ): Promise<void> {
    const existingUser = await this.userRepo.findOne({ where: { email } });

    if (existingUser && existingUser.id !== currentUserId) {
      throw new ConflictException('Email already in use');
    }
  }
}

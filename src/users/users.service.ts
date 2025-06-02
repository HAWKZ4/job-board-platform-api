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
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { hash } from 'bcryptjs';

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

  async getAllUsers() {
    return this.userRepo.find();
  }

  async getUser(query: { id?: number; email?: string }) {
    if (!query.id && !query.email) {
      throw new BadRequestException('Must provide either id or email');
    }
    const user = await this.userRepo.findOne({ where: query });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
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

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findUserOrThrow(id);
    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async deleteUser(id: number) {
    const user = await this.findUserOrThrow(id);
    return this.userRepo.remove(user);
  }

  async viewProfile(id: number) {
    const user = await this.findUserOrThrow(id);
    return user;
  }
  async updateProfile(id: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.findUserOrThrow(id);
    Object.assign(user, updateProfileDto);
    return this.userRepo.save(user);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.findUserOrThrow(userId);
    user.refreshToken = refreshToken;
    return this.userRepo.save(user);
  }
}

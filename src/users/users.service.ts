import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';

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

  async getUser(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);
    return this.userRepo.save(user);
  }

  async updateUser(id: number, updateUserDto: Partial<UpdateUserDto>) {
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
}

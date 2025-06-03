import { IsString } from 'class-validator';

export class DeleteOwnProfileDto {
  @IsString()
  password: string;
}

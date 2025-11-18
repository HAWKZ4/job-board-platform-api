import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional } from 'class-validator';

export class AdminSingleUserQueryDto {
  @ApiPropertyOptional({
    example: 'false',
    description: 'Whether to include soft-deleted users',
  })
  @IsOptional()
  @IsBooleanString()
  showDeleted?: boolean;
}

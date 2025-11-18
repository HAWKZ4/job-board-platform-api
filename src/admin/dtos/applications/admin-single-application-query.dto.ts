import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class AdminSingleApplicationQueryDto {
  @ApiPropertyOptional({
    example: 'false',
    description: 'Whether to include soft-deleted applications',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  showDeleted?: boolean;
}

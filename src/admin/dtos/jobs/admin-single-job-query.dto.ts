import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class AdminSingleJobQueryDto {
  @ApiPropertyOptional({
    example: 'false',
    description: 'Whether to include soft-deleted jobs',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  showDeleted?: boolean;
}

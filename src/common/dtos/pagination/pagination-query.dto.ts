import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination (default is 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page (default is 10)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit: number = 10;

  // Optional props if i would like to add them later

  // @ApiPropertyOptional({
  //   example: 'createdAt:DESC',
  //   description: 'Sorting field and direction, e.g., "createdAt:DESC"',
  // })
  // @IsOptional()
  // sortBy?: string;

  // @ApiPropertyOptional({
  //   example: 'developer',
  //   description: 'Search term for filtering results',
  // })
  // @IsOptional()
  // search?: string;
}

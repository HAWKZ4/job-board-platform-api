import { plainToInstance } from 'class-transformer';
import {
  IPaginationOptions,
  paginate as typeormPaginate,
} from 'nestjs-typeorm-paginate';

export async function paginateAndMap<Entity, DTO>(
  qb: any,
  options: IPaginationOptions,
  dtoClass: new (...args: any[]) => DTO,
) {
  const pagination = await typeormPaginate<Entity>(qb, options);

  const items = plainToInstance(dtoClass, pagination.items, {
    excludeExtraneousValues: true,
  });

  return {
    ...pagination,
    items,
  };
}

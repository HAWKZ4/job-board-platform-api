// Responsible for the transformation of the response (message + data)
import { ClassConstructor, plainToInstance } from 'class-transformer';

export function transformToDto<T>(dtoClass: ClassConstructor<T>, data: any): T {
  return plainToInstance(dtoClass, data, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true, // Auto-convert string to number/etc
    strategy: 'excludeAll', // Opt-in exposure (safer than @Expose everywhere)
  });
}

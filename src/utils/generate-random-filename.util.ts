import { randomBytes } from 'crypto';
import { extname } from 'path';

export function GenerateRandomFilename(originalName: string): string {
  const fileExt = extname(originalName);
  const randomName = randomBytes(16).toString('hex');
  return `${randomName}${fileExt}`;
}

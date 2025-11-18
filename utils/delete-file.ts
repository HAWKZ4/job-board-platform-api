import { promises as fs } from 'fs';
import { join } from 'path';

export async function deleteFile(relativePath: string) {
  if (!relativePath) return;
  const fullPath = join(process.cwd(), relativePath);

  try {
    await fs.access(fullPath);
    await fs.unlink(fullPath);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      throw err; // rethrow unexpected errors
    }
    // ENOENT = file not found, safe to ignore
  }
}

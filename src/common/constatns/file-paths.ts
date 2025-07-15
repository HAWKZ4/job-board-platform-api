import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export const RESUME_UPLOADS_DIR =
  process.env.RESUME_UPLOAD_PATH || join(process.cwd(), 'uploads', 'resumes');

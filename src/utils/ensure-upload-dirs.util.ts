import * as fs from 'fs';
import * as path from 'path';

export const ensureUploadDirsExists = () => {
  const resumeDir = path.join(process.cwd(), 'uploads', 'resumes');
  if (!fs.existsSync(resumeDir)) {
    fs.mkdirSync(resumeDir, { recursive: true });
    console.log('Created uploads/resumes directory');
  }
};

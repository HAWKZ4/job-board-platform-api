import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { GenerateRandomFilename } from '../utils/generate-random-filename.util';

export const resumeUploadOptions = {
  storage: diskStorage({
    destination: './uploads/resumes',
    filename: (req, file, cb) => {
      const uniqueName = GenerateRandomFilename(file.originalname);
      cb(null, uniqueName);
    },
  }),
  fileFilter(req, file, cb) {
    const allowedMime = 'application/pdf';
    if (file.mimetype !== allowedMime) {
      return cb(new BadRequestException('Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};

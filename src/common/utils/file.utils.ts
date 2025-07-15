import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { extname } from 'path';
import { VALID_FILENAME_REGEX } from '../constatns/constants';

export const fileNameEditor = (
  request: Request,
  file: any,
  callback: (error: any, filename) => void,
) => {
  const fileExt = extname(file.originalname);
  const newFileName = `resume-${Date.now()}${fileExt}`;

  callback(null, newFileName);
};

export const pdfFileFilter = (
  request: Request,
  file: Express.Multer.File,
  callback: (error: any, valid: boolean) => void,
) => {
  if (
    !file.originalname.match(/\.pdf$/i) ||
    file.mimetype !== 'application/pdf'
  ) {
    return callback(new BadRequestException('File must be of type pdf'), false);
  }

  // Validate filename format (security)
  if (!VALID_FILENAME_REGEX.test(file.originalname)) {
    return callback(new Error('Invalid filename format'), false);
  }

  callback(null, true);
};

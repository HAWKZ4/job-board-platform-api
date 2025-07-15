import { SetMetadata } from '@nestjs/common';
export const RESPONSE_MESSAGE_KEY = 'response_message';

export const SetResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);

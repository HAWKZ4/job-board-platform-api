import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from 'src/common/dtos/user/safe-user.dto';

export class LoginUserResponseDto {
  @ApiProperty({
    type: () => SafeUserDto,
    description: 'Authenticated user data',
  })
  user: SafeUserDto;
}

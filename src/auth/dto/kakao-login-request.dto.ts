import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KakaoLoginRequestDto {
  @ApiProperty({ description: '인가 코드' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

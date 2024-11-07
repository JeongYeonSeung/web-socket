import { ApiProperty } from '@nestjs/swagger';

export class KakaoLoginRequestDto {
  @ApiProperty({ description: '인가 코드' })
  code: string;
}

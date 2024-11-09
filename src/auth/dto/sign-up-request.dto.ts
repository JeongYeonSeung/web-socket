import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Sex } from 'src/common/enums/sex.enum';

export class SignUpRequestDto {
  @ApiProperty({ description: '성별' })
  @IsEnum(Sex)
  @IsNotEmpty()
  sex: Sex;

  @ApiProperty({ description: '생년월일, yyyy-mm-dd 형식' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '생년월일은 yyyy-mm-dd 형식이어야 합니다.',
  })
  @IsString()
  @IsNotEmpty()
  birthday: string;

  @ApiProperty({ description: '닉네임' })
  @MaxLength(10, { message: '닉네임은 최대 10자만 가능합니다.' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '프로필 사진 url' })
  @IsString()
  @IsNotEmpty()
  profileUrl: string;
}

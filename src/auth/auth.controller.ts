import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { KakaoLoginRequestDto } from './dto/kakao-login-request.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({
    summary: '카카오 로그인',
    description: '인가 코드를 받아 유저를 생성하고 쿠키에 토큰을 담아 반환',
  })
  @ApiBody({ type: KakaoLoginRequestDto })
  @Post('/kakao')
  async kakaoLogin(
    @Body() body: KakaoLoginRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    // 카카오 서버와 통신하여 액세스 토큰을 발급받음
    const accessToken = await this.authService.getAccessToken(body.code);

    // 액세스 토큰을 통해 사용자 정보 가져옴
    const kakaoUserInfo = await this.authService.getUserInfo(accessToken);

    // DB에 사용자 정보 저장 또는 찾기
    const userInfoDto = await this.usersService.findOrCreateById(
      kakaoUserInfo.id,
    );

    // JWT 토큰 발급
    const token = await this.authService.getToken(userInfoDto.payload);

    // 쿠키에 액세스 토큰과 리프레시 토큰 설정
    res.cookie('access-token', token.accessToken, {
      expires: new Date(Date.now() + 60000 + 9 * 60 * 60 * 1000),
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.cookie('refresh-token', token.refreshToken, {
      expires: new Date(Date.now() + 60000 + 9 * 60 * 60 * 1000),
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    await this.authService.saveRefreshToken(
      token.refreshToken,
      userInfoDto.payload.id,
    );

    // 프론트엔드로 최종 응답 전송
    res.json({ message: 'Login successful' });
  }
}

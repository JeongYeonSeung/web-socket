import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { JwtPayload } from 'src/common/interface/auth.interface';
import { TokenResponseDto } from './dto/token-response-dto';
import { Repository } from 'typeorm';
import { TokenEntity } from 'src/entity/token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
  ) {}

  async getAccessToken(code: string): Promise<string> {
    const tokenUrl = 'https://kauth.kakao.com/oauth/token';
    const params = {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID,
      redirect_uri: 'http://localhost:5173/kakao/callback',
      code: code,
    };
    const headers = {
      'Content-type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, new URLSearchParams(params), {
          headers,
        }),
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new InternalServerErrorException('Error getting access token');
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(userInfoUrl, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw new Error('Error getting user info');
    }
  }

  async getToken(payload: JwtPayload): Promise<TokenResponseDto> {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.NODE_ENV === 'prod' ? '1h' : '3m',
      secret: process.env.JWT_SECRET_KEY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET_KEY,
    });

    return new TokenResponseDto(accessToken, refreshToken);
  }

  async saveRefreshToken(refreshToken: string, id: string): Promise<void> {
    const existingToken = await this.tokenRepository.findOne({
      where: { user: { id } },
    });
    if (existingToken) {
      existingToken.refreshToken = refreshToken;
      await this.tokenRepository.save(existingToken);
      console.log('updated');
    } else {
      const token = this.tokenRepository.create({
        refreshToken,
        user: { id },
      });
      await this.tokenRepository.save(token);
      console.log('saved');
    }
  }
}

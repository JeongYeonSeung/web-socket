import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/entity/users.entity';
import { TokenEntity } from 'src/entity/token.entity';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshStrategy } from './strategy/refresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, TokenEntity]),
    JwtModule.register({}),
    HttpModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, RefreshStrategy],
})
export class AuthModule {}

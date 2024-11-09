import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { JwtPayload } from '../interface/auth.interface';

export const AccessUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) throw new UnauthorizedException();
    return request.user;
  },
);

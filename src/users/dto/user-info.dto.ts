import { JwtPayload } from 'src/common/interface/auth.interface';
import { UsersEntity } from 'src/entity/users.entity';

export class UserInfoDto {
  payload: JwtPayload;

  constructor(user: UsersEntity) {
    this.payload = {
      id: user.id,
      signedAt: new Date().toISOString(),
    };
  }
}

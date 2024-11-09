import { SignUpRequestDto } from './../auth/dto/sign-up-request.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/entity/users.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/user-info.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async findOrCreateById(id: string): Promise<UserInfoDto> {
    let user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      user = this.usersRepository.create({
        id,
      });
      await this.usersRepository.save(user);
    }
    return new UserInfoDto(user);
  }

  async signup(
    signupRequestDto: SignUpRequestDto,
    userId: string,
  ): Promise<void> {
    const { sex, birthday, username, profileUrl } = signupRequestDto;
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    user.sex = sex;
    user.birthday = birthday;
    user.username = username;
    user.profileUrl = profileUrl;

    await this.usersRepository.save(user);
  }
}

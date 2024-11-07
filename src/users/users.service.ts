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
}

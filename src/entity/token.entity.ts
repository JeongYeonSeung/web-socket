import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('token')
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'refresh_token' })
  refreshToken: string;

  @ManyToOne(() => UsersEntity, () => undefined)
  user: UsersEntity;
}

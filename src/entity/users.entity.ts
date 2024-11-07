import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UsersEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true, length: 10 })
  name?: string;
}

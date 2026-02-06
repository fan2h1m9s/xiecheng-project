import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('USER')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_name', length: 100, nullable: true })
  userName!: string;

  @Column({ name: 'user_account', length: 50, nullable: true })
  userAccount!: string;

  @Column({ name: 'user_password', length: 255, nullable: true })
  userPassword!: string;

  @Column({ name: 'real_name', length: 100, nullable: true })
  realName!: string;

  @Column({ name: 'user_phone', length: 20, nullable: true })
  userPhone!: string;

  @Column({ name: 'user_email', length: 100, nullable: true })
  userEmail!: string;

  @Column({ name: 'register_time', type: 'datetime', nullable: true })
  registerTime!: Date;

  @Column({ name: 'last_login_time', type: 'datetime', nullable: true })
  lastLoginTime!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('keyword')
export class Keyword {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'key_name', length: 100, nullable: true })
  keyName!: string;

  @Column({ name: 'is_default', nullable: true })
  isDefault!: boolean;
}
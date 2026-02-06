import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, nullable: true })
  address!: string;

  @Column({ name: 'add_state', type: 'tinyint', nullable: true })
  addState!: number;

  @Column({ name: 'add_id', nullable: true })
  addId!: number;
}

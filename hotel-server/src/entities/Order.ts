import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_number', length: 50, nullable: true })
  orderNumber!: string;

  @Column({ name: 'order_status',type:'tinyint', nullable: false })
  orderStatus!: number;

  @Column({ name: 'order_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  orderTotalPrice!: number;

  @Column({ name: 'order_time', type: 'datetime', nullable: true })
  orderCreateTime!: Date;

  @Column({ name: 'order_user_id', nullable: true })
  userId!: number;

  @Column({ name: 'check_in_time', type: 'datetime', nullable: true })
  orderCheckInTime!: Date;

  @Column({ name: 'check_out_time', type: 'datetime', nullable: true })
  orderCheckOutTime!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'order_user_id' })
  user!: User;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_number', length: 50, nullable: true })
  orderNumber!: string;

  @Column({ name: 'order_status', length: 20, nullable: true })
  orderStatus!: string;

  @Column({ name: 'order_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  orderPrice!: number;

  @Column({ name: 'order_time', type: 'datetime', nullable: true })
  orderTime!: Date;

  @Column({ name: 'order_user_id', nullable: true })
  orderUserId!: number;

  @Column({ name: 'check_in_time', type: 'datetime', nullable: true })
  checkInTime!: Date;

  @Column({ name: 'check_out_time', type: 'datetime', nullable: true })
  checkOutTime!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'order_user_id' })
  user!: User;
}

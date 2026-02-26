import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './Order';
import { RoomType } from './RoomType';

@Entity('order_room_relation')
export class OrderRoomRelation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_id', nullable: true })
  orderId!: number;

  @Column({ name: 'room_type_id', nullable: true })
  roomTypeId!: number;

  @Column({ nullable: true })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice!: number;

  @Column({ name: 'subtotal_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotalPrice!: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => RoomType)
  @JoinColumn({ name: 'room_type_id' })
  roomType!: RoomType;
}

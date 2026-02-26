import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Hotel } from './Hotel';
import { Room } from './Room';

@Entity('room_type')
export class RoomType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'room_type_name', length: 100, nullable: true })
  roomTypeName!: string;

  @Column({ name: 'room_type_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  roomTypePrice!: number;

  @Column({ name: 'room_type_dis', type: 'text', nullable: true })
  roomTypeDescription!: string;

  @Column({ name: 'room_type_rest', nullable: true })
  roomTypeRest!: number;

  @Column({ name: 'hotel_id', nullable: true })
  hotelId!: number;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;

  @OneToMany(() => Room, room => room.roomType)
  rooms!: Room[];
}

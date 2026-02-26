import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoomType } from './RoomType';
import { Hotel } from './Hotel';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'room_number', length: 20, nullable: true })
  roomNumber!: string;

  @Column({ name: 'room_name', length: 100, nullable: true })
  roomName!: string;

  @Column({ name: 'room_status', type: 'tinyint', nullable: true })
  roomStatus!: number;

  @Column({ name: 'room_type_id', nullable: true })
  roomTypeId!: number;

  @Column({ name: 'hotel_id', nullable: true })
  hotelId!: number;

  @Column({ name: 'room_area', type: 'decimal', precision: 8, scale: 2, nullable: true })
  roomArea!: number;

  @Column({ name: 'room_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  roomPrice!: number;

  @ManyToOne(() => RoomType)
  @JoinColumn({ name: 'room_type_id' })
  roomType!: RoomType;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;
}

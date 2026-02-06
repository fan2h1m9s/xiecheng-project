import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoomType } from './RoomType';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'room_number', length: 20, nullable: true })
  roomNumber!: string;

  @Column({ name: 'room_name', length: 100, nullable: true })
  roomName!: string;

  @Column({ name: 'room_status', length: 20, nullable: true })
  roomStatus!: string;

  @Column({ name: 'room_type_id', nullable: true })
  roomTypeId!: number;

  @Column({ name: 'room_area', type: 'decimal', precision: 8, scale: 2, nullable: true })
  roomArea!: number;

  @ManyToOne(() => RoomType)
  @JoinColumn({ name: 'room_type_id' })
  roomType!: RoomType;
}

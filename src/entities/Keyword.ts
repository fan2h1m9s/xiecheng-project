import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Hotel } from './Hotel';
import { RoomType } from './RoomType';

@Entity('keyword')
export class Keyword {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'key_name', length: 100, nullable: false })
  keyName!: string;

  @Column({ name: 'hotel_id', nullable: true })
  hotelId!: number;

  @Column({ name: 'room_type_id', nullable: true })
  roomTypeId!: number;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;

  @ManyToOne(() => RoomType)
  @JoinColumn({ name: 'room_type_id' })
  roomType!: RoomType;
}
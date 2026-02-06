import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('room_type')
export class RoomType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'room_type_name', length: 100, nullable: true })
  roomTypeName!: string;

  @Column({ name: 'room_type_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  roomTypePrice!: number;

  @Column({ name: 'room_type_dis', type: 'text', nullable: true })
  roomTypeDis!: string;

  @Column({ name: 'room_type_rest', nullable: true })
  roomTypeRest!: number;
}

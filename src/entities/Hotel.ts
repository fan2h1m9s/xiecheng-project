import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { RoomType } from './RoomType';

@Entity('hotel')
export class Hotel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'hotel_name_zh', length: 200, nullable: true })
  hotelNameZh!: string;

  @Column({ name: 'hotel_name_en', length: 200, nullable: true })
  hotelNameEn!: string;

  @Column({ name: 'hotel_address', length: 500, nullable: true })
  hotelAddress!: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number | string;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number | string;

  @Column({ name: 'hotel_stars', type: 'tinyint', nullable: true })
  hotelStars!: number;

  @Column({ name: 'hotel_tele', length: 20, nullable: true })
  hotelTele!: string;

  @Column({ name: 'hotel_dis', type: 'text', nullable: true })
  hotelDis!: string;

  @Column({ name: 'hotel_opening_time', type: 'datetime', nullable: true })
  hotelOpeningTime!: Date;

  @Column({ name: 'earliest_check_in', type: 'time', nullable: true })
  earliestCheckIn!: string;

  @Column({ name: 'latest_check_out', type: 'time', nullable: true })
  latestCheckOut!: string;

  @Column({ name: 'hotel_status', type: 'tinyint', nullable: true })
  hotelStatus!: number;

  @Column({ name: 'hotel_region', type: 'tinyint', nullable: true })
  hotelRegion!: number;

  @Column({ name: 'hotel_remarks', type: 'text', nullable: true })
  hotelRemark!: string;
  @Column({ name: 'user_id', nullable: true })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => RoomType, roomType => roomType.hotel)
  roomTypes!: RoomType[];
}

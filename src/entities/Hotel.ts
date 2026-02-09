import { type } from 'os';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ name: 'hotel_region', type: 'tinyint', default: 0 })
  hotelRegion!: number;
}

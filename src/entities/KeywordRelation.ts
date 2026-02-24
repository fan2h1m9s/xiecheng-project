import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Keyword } from './Keyword';
import { Hotel } from './Hotel';
import { RoomType } from './RoomType';

@Entity('keyword_relation')
export class KeywordRelation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'keyword_id', nullable: true })
  keywordId!: number;

  @Column({ name: 'hotel_id', nullable: true })
  hotelId!: number;

  @Column({ name: 'room_type_id', nullable: true })
  roomTypeId!: number;

  @ManyToOne(() => Keyword)
  @JoinColumn({ name: 'keyword_id' })
  keyword!: Keyword;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;

  @ManyToOne(() => RoomType)
  @JoinColumn({ name: 'room_type_id' })
  roomType!: RoomType;
}

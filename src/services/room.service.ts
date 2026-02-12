import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Room } from '../entities/Room';
import { RoomType } from '../entities/RoomType';

export class RoomService {
  private roomRepository: Repository<Room>;
  private roomTypeRepository: Repository<RoomType>;

  constructor() {
    this.roomRepository = AppDataSource.getRepository(Room);
    this.roomTypeRepository = AppDataSource.getRepository(RoomType);
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({
      relations: ['roomType'],
    });
  }

  async findOne(id: number): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { id },
      relations: ['roomType'],
    });
  }

  async create(roomData: Partial<Room>): Promise<Room> {
    const room = this.roomRepository.create(roomData);
    return this.roomRepository.save(room);
  }

  async update(id: number, roomData: Partial<Room>): Promise<Room | null> {
    await this.roomRepository.update(id, roomData);
    return this.roomRepository.findOne({
      where: { id },
      relations: ['roomType'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.roomRepository.delete(id);
  }

  async findAllRoomTypes(): Promise<RoomType[]> {
    return this.roomTypeRepository.find();
  }

  async createRoomType(roomTypeData: Partial<RoomType>): Promise<RoomType> {
    const roomType = this.roomTypeRepository.create(roomTypeData);
    return this.roomTypeRepository.save(roomType);
  }

  async findAvailableRooms(): Promise<Room[]> {
    return this.roomRepository.find({
      where: { roomStatus: '空闲' },
      relations: ['roomType'],
    });
  }

  async findRoomsByHotel(hotelId: number): Promise<Room[]> {
    // 这里需要根据实际的酒店-房间关联关系进行查询
    // 假设Room实体中有hotelId字段
    return this.roomRepository.find({
      where: { /* hotelId: hotelId */ },
      relations: ['roomType'],
    });
  }
} 

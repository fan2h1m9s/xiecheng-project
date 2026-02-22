import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Room } from '../entities/Room';
import { RoomType } from '../entities/RoomType';
import { Keyword } from '../entities/Keyword';

export class RoomService {
  private roomRepository: Repository<Room>;
  private roomTypeRepository: Repository<RoomType>;
  private keywordRepository: Repository<Keyword>;

  constructor() {
    this.roomRepository = AppDataSource.getRepository(Room);
    this.roomTypeRepository = AppDataSource.getRepository(RoomType);
    this.keywordRepository = AppDataSource.getRepository(Keyword);
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

  async createRoomType(roomTypeData: Partial<RoomType>, keywords?: string[]): Promise<RoomType> {
    const roomType = this.roomTypeRepository.create(roomTypeData);
    const savedRoomType = await this.roomTypeRepository.save(roomType);
    
    // 处理关键词标签
    if (keywords && keywords.length > 0) {
      for (const keyword of keywords) {
        const keywordEntity = this.keywordRepository.create({
          keyword,
          roomTypeId: savedRoomType.id
        });
        await this.keywordRepository.save(keywordEntity);
      }
    }
    
    return savedRoomType;
  }

  async updateRoomType(id: number, roomTypeData: Partial<RoomType>, keywords?: string[]): Promise<RoomType | null> {
    await this.roomTypeRepository.update(id, roomTypeData);
    const updatedRoomType = await this.roomTypeRepository.findOneBy({ id });
    
    // 处理关键词标签
    if (updatedRoomType && keywords !== undefined) {
      // 删除现有的关键词记录
      await this.keywordRepository.delete({ roomTypeId: id });
      
      // 创建新的关键词记录
      if (keywords.length > 0) {
        for (const keyword of keywords) {
          const keywordEntity = this.keywordRepository.create({
            keyword,
            roomTypeId: updatedRoomType.id
          });
          await this.keywordRepository.save(keywordEntity);
        }
      }
    }
    
    return updatedRoomType;
  }

  async findAvailableRooms(): Promise<Room[]> {
    return this.roomRepository.find({
      where: { roomStatus: 0 },
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

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
    // 创建QueryRunner
    const queryRunner = AppDataSource.createQueryRunner();
    
    // 开始事务
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const roomType = this.roomTypeRepository.create(roomTypeData);
      const savedRoomType = await queryRunner.manager.save(roomType);
      
      // 处理关键词标签
      if (keywords && keywords.length > 0) {
        for (const keyword of keywords) {
          const keywordEntity = this.keywordRepository.create({
            keyword,
            roomTypeId: savedRoomType.id
          });
          await queryRunner.manager.save(keywordEntity);
        }
      }
      
      // 提交事务
      await queryRunner.commitTransaction();
      
      return savedRoomType;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放QueryRunner
      await queryRunner.release();
    }
  }

  async updateRoomType(id: number, roomTypeData: Partial<RoomType>, keywords?: string[]): Promise<RoomType | null> {
    // 创建QueryRunner
    const queryRunner = AppDataSource.createQueryRunner();
    
    // 开始事务
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      await queryRunner.manager.update(RoomType, id, roomTypeData);
      const updatedRoomType = await queryRunner.manager.findOneBy(RoomType, { id });
      
      // 处理关键词标签
      if (updatedRoomType && keywords !== undefined) {
        // 删除现有的关键词记录
        await queryRunner.manager.delete(Keyword, { roomTypeId: id });
        
        // 创建新的关键词记录
        if (keywords.length > 0) {
          for (const keyword of keywords) {
            const keywordEntity = this.keywordRepository.create({
              keyword,
              roomTypeId: updatedRoomType.id
            });
            await queryRunner.manager.save(keywordEntity);
          }
        }
      }
      
      // 提交事务
      await queryRunner.commitTransaction();
      
      return updatedRoomType;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放QueryRunner
      await queryRunner.release();
    }
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

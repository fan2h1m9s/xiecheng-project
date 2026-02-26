import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Room } from '../entities/Room';
import { RoomType } from '../entities/RoomType';
import { Keyword } from '../entities/Keyword';
import { KeywordRelation } from '../entities/KeywordRelation';
import { RoomStatus } from '../enums/room-status.enum';

export class RoomService {
  private roomRepository: Repository<Room>;
  private roomTypeRepository: Repository<RoomType>;
  private keywordRepository: Repository<Keyword>;
  private keywordRelationRepository: Repository<KeywordRelation>;

  constructor() {
    this.roomRepository = AppDataSource.getRepository(Room);
    this.roomTypeRepository = AppDataSource.getRepository(RoomType);
    this.keywordRepository = AppDataSource.getRepository(Keyword);
    this.keywordRelationRepository = AppDataSource.getRepository(KeywordRelation);
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
          // 查找或创建关键词
          let keywordEntity = await queryRunner.manager.findOne(Keyword, {
            where: { keyName: keyword }
          });
          
          if (!keywordEntity) {
            keywordEntity = this.keywordRepository.create({
              keyName: keyword
            });
            keywordEntity = await queryRunner.manager.save(keywordEntity);
          }
          
          // 创建关键词关联
          const keywordRelation = this.keywordRelationRepository.create({
            keywordId: keywordEntity.id,
            roomTypeId: savedRoomType.id
          });
          await queryRunner.manager.save(keywordRelation);
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
        // 删除现有的关键词关联记录
        await queryRunner.manager.delete(KeywordRelation, { roomTypeId: id });
        
        // 创建新的关键词关联记录
        if (keywords.length > 0) {
          for (const keyword of keywords) {
            // 查找或创建关键词
            let keywordEntity = await queryRunner.manager.findOne(Keyword, {
              where: { keyName: keyword }
            });
            
            if (!keywordEntity) {
              keywordEntity = this.keywordRepository.create({
                keyName: keyword
              });
              keywordEntity = await queryRunner.manager.save(keywordEntity);
            }
            
            // 创建关键词关联
            const keywordRelation = this.keywordRelationRepository.create({
              keywordId: keywordEntity.id,
              roomTypeId: updatedRoomType.id
            });
            await queryRunner.manager.save(keywordRelation);
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
      where: { roomStatus: RoomStatus.AVAILABLE },
      relations: ['roomType', 'hotel'],
    });
  }

  async findRoomsByHotel(hotelId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { hotelId },
      relations: ['roomType'],
    });
  }

  async updateRoomStatus(roomId: number, status: RoomStatus): Promise<Room | null> {
    await this.roomRepository.update(roomId, { roomStatus: status });
    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['roomType', 'hotel'],
    });
  }

  async findRoomsByRoomType(roomTypeId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { roomTypeId },
      relations: ['roomType', 'hotel'],
    });
  }

  async findAvailableRoomsByHotel(hotelId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { hotelId, roomStatus: RoomStatus.AVAILABLE },
      relations: ['roomType'],
    });
  }
} 

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Hotel } from '../entities/Hotel';
import { Keyword } from '../entities/Keyword';
import { KeywordRelation } from '../entities/KeywordRelation';
import { ElasticsearchService } from './elasticsearch.service';

export class HotelService {
  private hotelRepository: Repository<Hotel>;
  private keywordRepository: Repository<Keyword>;
  private keywordRelationRepository: Repository<KeywordRelation>;
  private elasticsearchService: ElasticsearchService;
  private hasGeoColumnsCache: boolean | null = null;

  constructor() {
    this.hotelRepository = AppDataSource.getRepository(Hotel);
    this.keywordRepository = AppDataSource.getRepository(Keyword);
    this.keywordRelationRepository = AppDataSource.getRepository(KeywordRelation);
    this.elasticsearchService = new ElasticsearchService();
  }

  private async hasGeoColumns(): Promise<boolean> {
    if (this.hasGeoColumnsCache !== null) {
      return this.hasGeoColumnsCache;
    }

    try {
      const rows = await AppDataSource.query(
        "SHOW COLUMNS FROM hotel WHERE Field IN ('latitude', 'longitude')"
      );
      this.hasGeoColumnsCache = Array.isArray(rows) && rows.length === 2;
    } catch (error) {
      this.hasGeoColumnsCache = false;
    }

    return this.hasGeoColumnsCache;
  }

  async findAll(): Promise<Hotel[]> {
    const hasGeoColumns = await this.hasGeoColumns();
    const select: any = {
      id: true,
      hotelNameZh: true,
      hotelNameEn: true,
      hotelAddress: true,
      hotelStars: true,
      hotelTele: true,
      hotelDis: true,
      hotelOpeningTime: true,
      earliestCheckIn: true,
      latestCheckOut: true,
      hotelStatus: true,
      userId: true
    };

    if (hasGeoColumns) {
      select.latitude = true;
      select.longitude = true;
    }

    return this.hotelRepository.find({
      select
    });
  }

  async findOne(id: number): Promise<Hotel | null> {
    return this.hotelRepository.findOneBy({ id });
  }

  async create(hotelData: Partial<Hotel>, keywords?: string[]): Promise<Hotel> {
    // 如果未传入酒店状态，默认为待审核
    if (hotelData.hotelStatus === undefined || hotelData.hotelStatus === null) {
      hotelData.hotelStatus = 0; // 默认待审核
    }
    
    // 创建QueryRunner
    const queryRunner = AppDataSource.createQueryRunner();
    
    // 开始事务
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const hotel = this.hotelRepository.create(hotelData);
      const savedHotel = await queryRunner.manager.save(hotel);
      
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
            hotelId: savedHotel.id
          });
          await queryRunner.manager.save(keywordRelation);
        }
      }
      
      // 提交事务
      await queryRunner.commitTransaction();
      
      // 同步到ElasticSearch
      await this.elasticsearchService.indexHotel(savedHotel);
      
      return savedHotel;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放QueryRunner
      await queryRunner.release();
    }
  }

  async update(id: number, hotelData: Partial<Hotel>, keywords?: string[]): Promise<Hotel | null> {
    // 创建QueryRunner
    const queryRunner = AppDataSource.createQueryRunner();
    
    // 开始事务
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      await queryRunner.manager.update(Hotel, id, hotelData);
      const updatedHotel = await queryRunner.manager.findOneBy(Hotel, { id });
      
      // 处理关键词标签
      if (updatedHotel && keywords !== undefined) {
        // 删除现有的关键词关联记录
        await queryRunner.manager.delete(KeywordRelation, { hotelId: id });
        
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
              hotelId: updatedHotel.id
            });
            await queryRunner.manager.save(keywordRelation);
          }
        }
      }
      
      // 提交事务
      await queryRunner.commitTransaction();
      
      // 同步到ElasticSearch
      if (updatedHotel) {
        await this.elasticsearchService.updateHotel(updatedHotel);
      }
      
      return updatedHotel;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放QueryRunner
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    // 创建QueryRunner
    const queryRunner = AppDataSource.createQueryRunner();
    
    // 开始事务
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 删除相关的关键词关联记录
      await queryRunner.manager.delete(KeywordRelation, { hotelId: id });
      
      await queryRunner.manager.delete(Hotel, id);
      
      // 提交事务
      await queryRunner.commitTransaction();
      
      // 从ElasticSearch删除
      await this.elasticsearchService.deleteHotel(id);
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放QueryRunner
      await queryRunner.release();
    }
  }

  async syncAllHotelsToElasticSearch(): Promise<void> {
    const hotels = await this.hotelRepository.find();
    await this.elasticsearchService.reindexAllHotels(hotels);
  }
}

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Hotel } from '../entities/Hotel';
import { Keyword } from '../entities/Keyword';
import { ElasticsearchService } from './elasticsearch.service';

export class HotelService {
  private hotelRepository: Repository<Hotel>;
  private keywordRepository: Repository<Keyword>;
  private elasticsearchService: ElasticsearchService;

  constructor() {
    this.hotelRepository = AppDataSource.getRepository(Hotel);
    this.keywordRepository = AppDataSource.getRepository(Keyword);
    this.elasticsearchService = new ElasticsearchService();
  }

  async findAll(): Promise<Hotel[]> {
    return this.hotelRepository.find();
  }

  async findOne(id: number): Promise<Hotel | null> {
    return this.hotelRepository.findOneBy({ id });
  }

  async create(hotelData: Partial<Hotel>, keywords?: string[]): Promise<Hotel> {
    // 如果未传入酒店状态，默认为待审核
    if (hotelData.hotelStatus === undefined || hotelData.hotelStatus === null) {
      hotelData.hotelStatus = 0; // 默认待审核
    }
    
    const hotel = this.hotelRepository.create(hotelData);
    const savedHotel = await this.hotelRepository.save(hotel);
    
    // 处理关键词标签
    if (keywords && keywords.length > 0) {
      for (const keyword of keywords) {
        const keywordEntity = this.keywordRepository.create({
          keyword,
          hotelId: savedHotel.id
        });
        await this.keywordRepository.save(keywordEntity);
      }
    }
    
    // 同步到ElasticSearch
    await this.elasticsearchService.indexHotel(savedHotel);
    
    return savedHotel;
  }

  async update(id: number, hotelData: Partial<Hotel>, keywords?: string[]): Promise<Hotel | null> {
    await this.hotelRepository.update(id, hotelData);
    const updatedHotel = await this.hotelRepository.findOneBy({ id });
    
    // 处理关键词标签
    if (updatedHotel && keywords !== undefined) {
      // 删除现有的关键词记录
      await this.keywordRepository.delete({ hotelId: id });
      
      // 创建新的关键词记录
      if (keywords.length > 0) {
        for (const keyword of keywords) {
          const keywordEntity = this.keywordRepository.create({
            keyword,
            hotelId: updatedHotel.id
          });
          await this.keywordRepository.save(keywordEntity);
        }
      }
    }
    
    // 同步到ElasticSearch
    if (updatedHotel) {
      await this.elasticsearchService.updateHotel(updatedHotel);
    }
    
    return updatedHotel;
  }

  async remove(id: number): Promise<void> {
    // 删除相关的关键词记录
    await this.keywordRepository.delete({ hotelId: id });
    
    await this.hotelRepository.delete(id);
    
    // 从ElasticSearch删除
    await this.elasticsearchService.deleteHotel(id);
  }

  async syncAllHotelsToElasticSearch(): Promise<void> {
    const hotels = await this.hotelRepository.find();
    await this.elasticsearchService.reindexAllHotels(hotels);
  }
}

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Hotel } from '../entities/Hotel';
import { ElasticsearchService } from './elasticsearch.service';

export class HotelService {
  private hotelRepository: Repository<Hotel>;
  private elasticsearchService: ElasticsearchService;

  constructor() {
    this.hotelRepository = AppDataSource.getRepository(Hotel);
    this.elasticsearchService = new ElasticsearchService();
  }

  async findAll(): Promise<Hotel[]> {
    return this.hotelRepository.find();
  }

  async findOne(id: number): Promise<Hotel | null> {
    return this.hotelRepository.findOneBy({ id });
  }

  async create(hotelData: Partial<Hotel>): Promise<Hotel> {
    // 如果未传入酒店状态，默认为待审核
    if (hotelData.hotelStatus === undefined || hotelData.hotelStatus === null) {
      hotelData.hotelStatus = 0; // 默认待审核
    }
    
    const hotel = this.hotelRepository.create(hotelData);
    const savedHotel = await this.hotelRepository.save(hotel);
    
    // 同步到ElasticSearch
    await this.elasticsearchService.indexHotel(savedHotel);
    
    return savedHotel;
  }

  async update(id: number, hotelData: Partial<Hotel>): Promise<Hotel | null> {
    await this.hotelRepository.update(id, hotelData);
    const updatedHotel = await this.hotelRepository.findOneBy({ id });
    
    // 同步到ElasticSearch
    if (updatedHotel) {
      await this.elasticsearchService.updateHotel(updatedHotel);
    }
    
    return updatedHotel;
  }

  async remove(id: number): Promise<void> {
    await this.hotelRepository.delete(id);
    
    // 从ElasticSearch删除
    await this.elasticsearchService.deleteHotel(id);
  }

  async syncAllHotelsToElasticSearch(): Promise<void> {
    const hotels = await this.hotelRepository.find();
    await this.elasticsearchService.reindexAllHotels(hotels);
  }
}

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Hotel } from '../entities/Hotel';

export class HotelService {
  private hotelRepository: Repository<Hotel>;

  constructor() {
    this.hotelRepository = AppDataSource.getRepository(Hotel);
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
    return this.hotelRepository.save(hotel);
  }

  async update(id: number, hotelData: Partial<Hotel>): Promise<Hotel | null> {
    await this.hotelRepository.update(id, hotelData);
    return this.hotelRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.hotelRepository.delete(id);
  }
}

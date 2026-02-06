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

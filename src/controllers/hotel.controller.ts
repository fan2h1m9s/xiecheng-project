import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';

export class HotelController {
  private hotelService: HotelService;

  constructor() {
    this.hotelService = new HotelService();
  }

  getAllHotels = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotels = await this.hotelService.findAll();
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ error: '获取酒店列表失败' });
    }
  };

  getHotelById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const hotel = await this.hotelService.findOne(id);
      if (hotel) {
        res.json(hotel);
      } else {
        res.status(404).json({ error: '酒店不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '获取酒店失败' });
    }
  };

  createHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotel = await this.hotelService.create(req.body);
      res.status(201).json(hotel);
    } catch (error) {
      res.status(500).json({ error: '创建酒店失败' });
    }
  };

  updateHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const hotel = await this.hotelService.update(id, req.body);
      if (hotel) {
        res.json(hotel);
      } else {
        res.status(404).json({ error: '酒店不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '更新酒店失败' });
    }
  };

  deleteHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      await this.hotelService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: '删除酒店失败' });
    }
  };
}

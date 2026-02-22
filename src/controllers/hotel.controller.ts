import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';
import { ElasticsearchService } from '../services/elasticsearch.service';

export class HotelController {
  private hotelService: HotelService;
  private elasticsearchService: ElasticsearchService;

  constructor() {
    this.hotelService = new HotelService();
    this.elasticsearchService = new ElasticsearchService();
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

  searchHotels = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q, page = 1, pageSize = 10 } = req.query;
      const query = q as string;
      const pageNum = parseInt(page as string);
      const size = parseInt(pageSize as string);

      if (!query) {
        res.status(400).json({ error: '搜索关键词不能为空' });
        return;
      }

      const result = await this.elasticsearchService.searchHotels(query, pageNum, size);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: '搜索酒店失败' });
    }
  };

  syncHotelsToES = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.hotelService.syncAllHotelsToElasticSearch();
      res.json({ message: '酒店数据同步到ElasticSearch成功' });
    } catch (error) {
      res.status(500).json({ error: '同步酒店数据失败' });
    }
  };
}

import { Request, Response } from 'express';
import { RoomService } from '../services/room.service';

export class RoomController {
  private roomService: RoomService;

  constructor() {
    this.roomService = new RoomService();
  }

  getAllRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const rooms = await this.roomService.findAll();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: '获取房间列表失败' });
    }
  };

  getRoomById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const room = await this.roomService.findOne(id);
      if (room) {
        res.json(room);
      } else {
        res.status(404).json({ error: '房间不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '获取房间失败' });
    }
  };

  createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const room = await this.roomService.create(req.body);
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ error: '创建房间失败' });
    }
  };

  updateRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const room = await this.roomService.update(id, req.body);
      if (room) {
        res.json(room);
      } else {
        res.status(404).json({ error: '房间不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '更新房间失败' });
    }
  };

  deleteRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      await this.roomService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: '删除房间失败' });
    }
  };

  getAllRoomTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const roomTypes = await this.roomService.findAllRoomTypes();
      res.json(roomTypes);
    } catch (error) {
      res.status(500).json({ error: '获取房间类型列表失败' });
    }
  };

  createRoomType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { keywords, ...roomTypeData } = req.body;
      const roomType = await this.roomService.createRoomType(roomTypeData, keywords);
      res.status(201).json(roomType);
    } catch (error) {
      res.status(500).json({ error: '创建房间类型失败' });
    }
  };

  updateRoomType = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const { keywords, ...roomTypeData } = req.body;
      const roomType = await this.roomService.updateRoomType(id, roomTypeData, keywords);
      if (roomType) {
        res.json(roomType);
      } else {
        res.status(404).json({ error: '房间类型不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '更新房间类型失败' });
    }
  };

  getAvailableRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const availableRooms = await this.roomService.findAvailableRooms();
      res.json(availableRooms);
    } catch (error) {
      res.status(500).json({ error: '获取可用房间失败' });
    }
  };

  getRoomsByHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = parseInt(req.params.hotelId as string);
      const rooms = await this.roomService.findRoomsByHotel(hotelId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: '获取酒店房间失败' });
    }
  };
} 

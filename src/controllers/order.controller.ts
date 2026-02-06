import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.findAll();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: '获取订单列表失败' });
    }
  };

  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const order = await this.orderService.findOne(id);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: '订单不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '获取订单失败' });
    }
  };

  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.orderService.create(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: '创建订单失败' });
    }
  };

  updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const order = await this.orderService.update(id, req.body);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: '订单不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '更新订单失败' });
    }
  };

  deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      await this.orderService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: '删除订单失败' });
    }
  };

  getOrderRelations = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id as string);
      const relations = await this.orderService.findOrderRelations(orderId);
      res.json(relations);
    } catch (error) {
      res.status(500).json({ error: '获取订单房间关系失败' });
    }
  };

  createOrderRelation = async (req: Request, res: Response): Promise<void> => {
    try {
      const relation = await this.orderService.createOrderRelation(req.body);
      res.status(201).json(relation);
    } catch (error) {
      res.status(500).json({ error: '创建订单房间关系失败' });
    }
  };
}

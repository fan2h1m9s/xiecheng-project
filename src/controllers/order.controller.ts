import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../enums/order-status.enum';

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
      const order = await this.orderService.createOrder(req.body);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message || '创建订单失败' });
    }
  };

  payOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const order = await this.orderService.payOrder(id);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message || '支付订单失败' });
    }
  };

  checkInOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const order = await this.orderService.checkInOrder(id, req.body.roomAssignments);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message || '入住处理失败' });
    }
  };

  checkOutOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const order = await this.orderService.checkOutOrder(id, req.body.roomIds);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message || '退房处理失败' });
    }
  };

  cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const order = await this.orderService.cancelOrder(id);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message || '取消订单失败' });
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

  deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      await this.orderService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: '删除订单失败' });
    }
  };
}


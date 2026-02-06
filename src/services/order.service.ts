import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Order } from '../entities/Order';
import { OrderRoomRelation } from '../entities/OrderRoomRelation';

export class OrderService {
  private orderRepository: Repository<Order>;
  private orderRoomRelationRepository: Repository<OrderRoomRelation>;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderRoomRelationRepository = AppDataSource.getRepository(OrderRoomRelation);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async update(id: number, orderData: Partial<Order>): Promise<Order | null> {
    await this.orderRepository.update(id, orderData);
    return this.orderRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }

  async findOrderRelations(orderId: number): Promise<OrderRoomRelation[]> {
    return this.orderRoomRelationRepository.find({
      where: { orderId },
      relations: ['order', 'roomType'],
    });
  }

  async createOrderRelation(relationData: Partial<OrderRoomRelation>): Promise<OrderRoomRelation> {
    const relation = this.orderRoomRelationRepository.create(relationData);
    return this.orderRoomRelationRepository.save(relation);
  }
}

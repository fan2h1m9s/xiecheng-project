import { Repository, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Order } from '../entities/Order';
import { OrderRoomRelation } from '../entities/OrderRoomRelation';
import { RoomType } from '../entities/RoomType';
import { Room } from '../entities/Room';
import { OrderStatus } from '../enums/order-status.enum';

// 生成订单号
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

export class OrderService {
  private orderRepository: Repository<Order>;
  private orderRoomRelationRepository: Repository<OrderRoomRelation>;
  private roomTypeRepository: Repository<RoomType>;
  private roomRepository: Repository<Room>;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderRoomRelationRepository = AppDataSource.getRepository(OrderRoomRelation);
    this.roomTypeRepository = AppDataSource.getRepository(RoomType);
    this.roomRepository = AppDataSource.getRepository(Room);
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

  async findOrderWithRelations(orderId: number): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
  }

  async createOrder(orderData: {
    userId: number;
    checkInTime: Date;
    checkOutTime: Date;
    roomTypes: {
      roomTypeId: number;
      quantity: number;
    }[];
  }): Promise<Order> {
    // 开始事务
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 计算订单总价
      let totalPrice = 0;
      const orderRelations: OrderRoomRelation[] = [];

      // 检查并更新房型库存
      for (const item of orderData.roomTypes) {
        let roomType = await queryRunner.manager.findOne(RoomType, {
          where: { id: item.roomTypeId },
        });

        if (!roomType) {
          throw new Error(`房型不存在: ${item.roomTypeId}`);
        }

        if (roomType.roomTypeRest < item.quantity) {
          throw new Error(`房型库存不足: ${roomType.roomTypeName}`);
        }

        // 使用条件更新来解决并发问题
        // 只有当库存确实大于等于请求的数量时才进行更新
        const updateResult = await queryRunner.manager.update(
          RoomType,
          {
            id: item.roomTypeId,
            roomTypeRest: MoreThanOrEqual(item.quantity)
          },
          {
            roomTypeRest: () => `room_type_rest - ${item.quantity}`
          }
        );
        
        if (updateResult.affected === 0) {
          throw new Error(`房型库存不足: ${roomType.roomTypeName}`);
        }
        
        // 重新获取更新后的房型信息
        roomType = await queryRunner.manager.findOne(RoomType, {
          where: { id: item.roomTypeId },
        });

        if (!roomType) {
          throw new Error(`房型不存在: ${item.roomTypeId}`);
        }

        // 计算子总价
        const subtotal = parseFloat(roomType.roomTypePrice.toString()) * item.quantity;
        totalPrice += subtotal;

        // 创建订单房间关系
        const relation = queryRunner.manager.create(OrderRoomRelation, {
          roomTypeId: item.roomTypeId,
          quantity: item.quantity,
          unitPrice: roomType.roomTypePrice,
          subtotalPrice: subtotal,
        });
        orderRelations.push(relation);
      }

      // 创建订单
      const order = queryRunner.manager.create(Order, {
        orderNumber: generateOrderNumber(),
        orderStatus: OrderStatus.PENDING_PAYMENT,
        orderPrice: totalPrice,
        orderTime: new Date(),
        orderUserId: orderData.userId,
        checkInTime: orderData.checkInTime,
        checkOutTime: orderData.checkOutTime,
      });

      await queryRunner.manager.save(order);

      // 保存订单房间关系
      for (const relation of orderRelations) {
        relation.orderId = order.id;
        await queryRunner.manager.save(relation);
      }

      // 提交事务
      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  async payOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.orderStatus !== OrderStatus.PENDING_PAYMENT) {
      throw new Error('订单状态不是待付款');
    }

    // TODO: 调用第三方支付API
    console.log('调用第三方支付API...');

    // 更新订单状态
    order.orderStatus = OrderStatus.PAID_PENDING_CHECK_IN;
    return this.orderRepository.save(order);
  }

  async checkInOrder(orderId: number, roomAssignments: {
    roomTypeId: number;
    roomId: number;
  }[]): Promise<Order> {
    // 开始事务
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.orderStatus !== OrderStatus.PAID_PENDING_CHECK_IN) {
        throw new Error('订单状态不是已付款待入住');
      }

      // 验证并分配房间
      for (const assignment of roomAssignments) {
        const room = await queryRunner.manager.findOne(Room, {
          where: { id: assignment.roomId },
        });

        if (!room) {
          throw new Error(`房间不存在: ${assignment.roomId}`);
        }

        if (room.roomTypeId !== assignment.roomTypeId) {
          throw new Error(`房间类型不匹配: 房间 ${assignment.roomId} 属于类型 ${room.roomTypeId}`);
        }

        // 检查房间状态（假设0表示空闲）
        if (room.roomStatus !== 0) {
          throw new Error(`房间 ${assignment.roomId} 不可用，当前状态: ${room.roomStatus}`);
        }

        // 更新房间状态为已占用（假设1表示已占用）
        room.roomStatus = 1;
        await queryRunner.manager.save(room);
      }

      console.log('分配房间:', roomAssignments);

      // 更新订单状态
      order.orderStatus = OrderStatus.CHECKED_IN_PENDING_CHECK_OUT;
      await queryRunner.manager.save(order);

      // 提交事务
      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  async checkOutOrder(orderId: number, roomIds: number[]): Promise<Order> {
    // 开始事务
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.orderStatus !== OrderStatus.CHECKED_IN_PENDING_CHECK_OUT) {
        throw new Error('订单状态不是已入住待退房');
      }

      // 释放房间
      for (const roomId of roomIds) {
        const room = await queryRunner.manager.findOne(Room, {
          where: { id: roomId },
        });

        if (!room) {
          throw new Error(`房间不存在: ${roomId}`);
        }

        // 检查房间状态（假设1表示已占用）
        if (room.roomStatus !== 1) {
          throw new Error(`房间 ${roomId} 状态异常，当前状态: ${room.roomStatus}`);
        }

        // 更新房间状态为空闲（假设0表示空闲）
        room.roomStatus = 0;
        await queryRunner.manager.save(room);
      }

      console.log('处理退房，释放房间:', roomIds);

      // 更新订单状态
      order.orderStatus = OrderStatus.CHECKED_OUT;
      await queryRunner.manager.save(order);

      // 提交事务
      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  async cancelOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.orderStatus !== OrderStatus.PENDING_PAYMENT && order.orderStatus !== OrderStatus.PAID_PENDING_CHECK_IN) {
      throw new Error('只能取消待付款或已付款待入住的订单');
    }

    // 检查是否在入住时间之前
    if (new Date() >= order.orderCheckInTime) {
      throw new Error('入住时间已过，无法取消订单');
    }

    // 开始事务
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 恢复房型库存
      const relations = await queryRunner.manager.find(OrderRoomRelation, {
        where: { orderId: order.id },
      });

      for (const relation of relations) {
        // 使用条件更新来恢复库存，确保并发安全
        await queryRunner.manager.update(
          RoomType,
          {
            id: relation.roomTypeId
          },
          {
            roomTypeRest: () => `room_type_rest + ${relation.quantity}`
          }
        );
      }

      // TODO: 调用退款API
      console.log('调用退款API...');

      // 更新订单状态
      order.orderStatus = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      // 提交事务
      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  async findOrderRelations(orderId: number): Promise<OrderRoomRelation[]> {
    return this.orderRoomRelationRepository.find({
      where: { orderId },
      relations: ['order', 'roomType'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }
}

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateJWT, requireNormalUser, requireHotelOrSystemAdmin } from '../middleware/auth.middleware';
import { UserType } from '../enums/user-type.enum';

const router = Router();
const orderController = new OrderController();

// 应用JWT认证中间件
router.use(authenticateJWT);

// 订单查询 - 需要登录（普通用户可访问）
router.get('/', requireNormalUser, orderController.getAllOrders);
router.get('/:id', requireNormalUser, orderController.getOrderById);
router.get('/:id/relations', requireNormalUser, orderController.getOrderRelations);

// 订单创建 - 需要登录（普通用户可访问）
router.post('/', requireNormalUser, orderController.createOrder);

// 订单更新 - 需要酒店管理员或系统管理员权限
router.put('/:id', requireHotelOrSystemAdmin, orderController.updateOrder);

// 订单删除 - 需要酒店管理员或系统管理员权限
router.delete('/:id', requireHotelOrSystemAdmin, orderController.deleteOrder);

// 订单关系创建 - 需要登录（普通用户可访问）
router.post('/relations', requireNormalUser, orderController.createOrderRelation);

export default router;

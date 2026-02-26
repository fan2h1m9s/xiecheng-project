import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateJWT, requireAuth, requireHotelOrSystemAdmin } from '../middleware/auth.middleware';
import { UserType } from '../enums/user-type.enum';

const router = Router();
const orderController = new OrderController();

// 应用JWT认证中间件
router.use(authenticateJWT);

// 订单查询 - 需要登录（所有登录用户可访问）
router.get('/', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), orderController.getAllOrders);
router.get('/:id', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), orderController.getOrderById);
router.get('/:id/relations', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), orderController.getOrderRelations);

// 订单创建 - 需要登录（所有登录用户可访问）
router.post('/', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), orderController.createOrder);

// 订单支付 - 需要登录（所有登录用户可访问）
router.post('/:id/pay', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), orderController.payOrder);

// 订单入住 - 需要酒店管理员或系统管理员权限
router.post('/:id/check-in', requireHotelOrSystemAdmin, orderController.checkInOrder);

// 订单退房 - 需要酒店管理员或系统管理员权限
router.post('/:id/check-out', requireHotelOrSystemAdmin, orderController.checkOutOrder);

// 订单取消 - 需要登录（所有登录用户可访问）
router.post('/:id/cancel', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), orderController.cancelOrder);

// 订单删除 - 需要酒店管理员或系统管理员权限
router.delete('/:id', requireHotelOrSystemAdmin, orderController.deleteOrder);

export default router;

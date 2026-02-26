import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticateJWT, requireHotelOrSystemAdmin } from '../middleware/auth.middleware';

const router = Router();
const roomController = new RoomController();

// 公开访问的接口
// 房间查询 - 公开访问（普通用户可访问）
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.get('/types/all', roomController.getAllRoomTypes);

// 剩余空房查询 - 公开访问
router.get('/available', roomController.getAvailableRooms);

// 按酒店查询房间 - 公开访问
router.get('/hotel/:hotelId', roomController.getRoomsByHotel);

// 按房型查询房间 - 公开访问
router.get('/room-type/:roomTypeId', roomController.getRoomsByRoomType);

// 按酒店查询可用房间 - 公开访问
router.get('/hotel/:hotelId/available', roomController.getAvailableRoomsByHotel);

// 应用JWT认证中间件到需要认证的路由
const protectedRoutes = Router();
protectedRoutes.use(authenticateJWT);

// 房间创建 - 需要酒店管理员或系统管理员权限
protectedRoutes.post('/', requireHotelOrSystemAdmin, roomController.createRoom);

// 房间更新 - 需要酒店管理员或系统管理员权限
protectedRoutes.put('/:id', requireHotelOrSystemAdmin, roomController.updateRoom);

// 房间删除 - 需要酒店管理员或系统管理员权限
protectedRoutes.delete('/:id', requireHotelOrSystemAdmin, roomController.deleteRoom);

// 房间类型创建 - 需要酒店管理员或系统管理员权限
protectedRoutes.post('/types', requireHotelOrSystemAdmin, roomController.createRoomType);

// 房间类型更新 - 需要酒店管理员或系统管理员权限
protectedRoutes.put('/types/:id', requireHotelOrSystemAdmin, roomController.updateRoomType);

// 更新房间状态 - 需要酒店管理员或系统管理员权限
protectedRoutes.put('/:id/status', requireHotelOrSystemAdmin, roomController.updateRoomStatus);

// 应用保护路由
router.use('/', protectedRoutes);

export default router;

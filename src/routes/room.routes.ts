import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticateJWT, requireHotelOrSystemAdmin } from '../middleware/auth.middleware';

const router = Router();
const roomController = new RoomController();

// 应用JWT认证中间件
router.use(authenticateJWT);

// 房间查询 - 公开访问（普通用户可访问）
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.get('/types/all', roomController.getAllRoomTypes);

// 房间创建 - 需要酒店管理员或系统管理员权限
router.post('/', requireHotelOrSystemAdmin, roomController.createRoom);

// 房间更新 - 需要酒店管理员或系统管理员权限
router.put('/:id', requireHotelOrSystemAdmin, roomController.updateRoom);

// 房间删除 - 需要酒店管理员或系统管理员权限
router.delete('/:id', requireHotelOrSystemAdmin, roomController.deleteRoom);

// 房间类型创建 - 需要酒店管理员或系统管理员权限
router.post('/types', requireHotelOrSystemAdmin, roomController.createRoomType);

// 剩余空房查询 - 公开访问
router.get('/available', roomController.getAvailableRooms);

// 按酒店查询房间 - 公开访问
router.get('/hotel/:hotelId', roomController.getRoomsByHotel);

export default router;

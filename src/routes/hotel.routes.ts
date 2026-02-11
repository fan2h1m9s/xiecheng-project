import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';
import { authenticateJWT, requireHotelOrSystemAdmin, requireHotelOwnership } from '../middleware/auth.middleware';

const router = Router();
const hotelController = new HotelController();

// 应用JWT认证中间件
router.use(authenticateJWT);

// 酒店查询 - 公开访问（普通用户可访问）
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);

// 酒店创建 - 需要酒店管理员或系统管理员权限
router.post('/', requireHotelOrSystemAdmin, hotelController.createHotel);

// 酒店更新 - 需要管理员权限 + 所有权检查
router.put('/:id', requireHotelOrSystemAdmin, requireHotelOwnership, hotelController.updateHotel);

// 酒店删除 - 需要管理员权限 + 所有权检查
router.delete('/:id', requireHotelOrSystemAdmin, requireHotelOwnership, hotelController.deleteHotel);

export default router;

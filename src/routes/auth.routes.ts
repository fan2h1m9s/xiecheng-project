import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT, requireAuth, requireSystemAdmin, requireHotelAdmin } from '../middleware/auth.middleware';
import { UserType } from '../enums/user-type.enum';

const router = Router();
const authController = new AuthController();

// 应用JWT认证中间件到所有认证相关路由
router.use(authenticateJWT);

// 登录接口（公开）
router.post('/login', authController.login);

// 获取当前用户信息（需要登录）
router.get('/me', requireAuth(UserType.NORMAL_USER), authController.getCurrentUser);

// 测试不同权限的接口
router.get('/test/normal', requireAuth(UserType.NORMAL_USER), (req, res) => {
  res.json({ message: '普通用户可以访问' });
});

router.get('/test/hotel', requireHotelAdmin, (req, res) => {
  res.json({ message: '酒店管理员可以访问' });
});

router.get('/test/system', requireSystemAdmin, (req, res) => {
  res.json({ message: '系统管理员可以访问' });
});

export default router;

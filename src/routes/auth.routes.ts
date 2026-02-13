import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT, requireAuth, requireSystemAdmin, requireHotelAdmin } from '../middleware/auth.middleware';
import { UserType } from '../enums/user-type.enum';

const router = Router();
const authController = new AuthController();

// 登录接口（公开）
router.post('/login', authController.login);

// 应用JWT认证中间件到需要认证的路由
const protectedRoutes = Router();
protectedRoutes.use(authenticateJWT);

// 获取当前用户信息（需要登录，所有登录用户都可访问）
protectedRoutes.get('/me', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), authController.getCurrentUser);

// 测试不同权限的接口
protectedRoutes.get('/test/normal', requireAuth(UserType.NORMAL_USER), (req, res) => {
  res.json({ message: '普通用户可以访问' });
});

protectedRoutes.get('/test/hotel', requireHotelAdmin, (req, res) => {
  res.json({ message: '酒店管理员可以访问' });
});

protectedRoutes.get('/test/system', requireSystemAdmin, (req, res) => {
  res.json({ message: '系统管理员可以访问' });
});

router.use('/', protectedRoutes);

export default router;

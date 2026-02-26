import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, requireSystemAdmin, requireAuth } from '../middleware/auth.middleware';
import { UserType } from '../enums/user-type.enum';

const router = Router();
const userController = new UserController();

// 登录接口（公开）
router.post('/login', userController.login);

// 注册接口（公开）
router.post('/register', userController.createUser);

// 应用JWT认证中间件到需要认证的路由
const protectedRoutes = Router();
protectedRoutes.use(authenticateJWT);

// 获取当前用户信息（需要登录）
protectedRoutes.get('/me', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), userController.getCurrentUser);

// 注销接口（需要登录）
protectedRoutes.post('/logout', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), userController.logout);

// 用户查询 - 需要系统管理员权限
protectedRoutes.get('/', requireSystemAdmin, userController.getAllUsers);
// 查看用户信息 - 允许所有登录用户访问
protectedRoutes.get('/:id', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), userController.getUserById);

// 用户更新 - 需要系统管理员权限
protectedRoutes.put('/:id', requireSystemAdmin, userController.updateUser);

// 用户删除 - 需要系统管理员权限
protectedRoutes.delete('/:id', requireSystemAdmin, userController.deleteUser);

// 应用保护路由
router.use('/', protectedRoutes);

export default router;

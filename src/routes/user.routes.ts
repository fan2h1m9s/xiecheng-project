import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, requireSystemAdmin, requireNormalUser } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// 应用JWT认证中间件
router.use(authenticateJWT);

// 登录 - 公开访问
router.post('/login', userController.login);

// 注销 - 需要登录
router.post('/logout', requireNormalUser, userController.logout);

// 用户查询 - 需要系统管理员权限
router.get('/', requireSystemAdmin, userController.getAllUsers);
router.get('/:id', requireNormalUser, userController.getUserById);

// 用户创建 - 公开访问（注册功能）
router.post('/', userController.createUser);

// 用户更新 - 需要系统管理员权限
router.put('/:id', requireSystemAdmin, userController.updateUser);

// 用户删除 - 需要系统管理员权限
router.delete('/:id', requireSystemAdmin, userController.deleteUser);

export default router;

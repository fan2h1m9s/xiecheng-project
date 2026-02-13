import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, requireSystemAdmin, requireAuth } from '../middleware/auth.middleware';
import { UserType } from '../enums/user-type.enum';

const router = Router();
const userController = new UserController();

// 应用JWT认证中间件
router.use(authenticateJWT);



// 用户查询 - 需要系统管理员权限
router.get('/', requireSystemAdmin, userController.getAllUsers);
// 查看用户信息 - 允许所有登录用户访问
router.get('/:id', requireAuth(UserType.NORMAL_USER, UserType.HOTEL_ADMIN, UserType.SYSTEM_ADMIN), userController.getUserById);

// 用户创建 - 公开访问（注册功能）
router.post('/', userController.createUser);

// 用户更新 - 需要系统管理员权限
router.put('/:id', requireSystemAdmin, userController.updateUser);

// 用户删除 - 需要系统管理员权限
router.delete('/:id', requireSystemAdmin, userController.deleteUser);

export default router;

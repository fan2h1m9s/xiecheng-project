import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { PasswordUtil } from '../utils/password.util';
import { JwtUtil } from '../utils/jwt.util';
import { RedisUtil } from '../utils/redis.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserType } from '../enums/user-type.enum';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: '获取用户列表失败' });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const user = await this.userService.findOne(id);
      if (user) {
        // 不返回密码
        const { userPassword, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ error: '用户不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '获取用户失败' });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.create(req.body);
      // 不返回密码
      const { userPassword, ...userWithoutPassword } = user;
      
      // 生成JWT令牌
      const token = JwtUtil.generateToken({ userId: user.id, userAccount: user.userAccount });

      // 存储到Redis
      await RedisUtil.storeUserSession(user.id, token);

      // 返回用户信息和令牌
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      if (error.message === '账号已存在') {
        res.status(400).json({ error: error.message });
      } else if (error.message === '账号不能为空') {
        res.status(400).json({ error: error.message });
      } else if (error.message === '注册请求处理中，请稍后重试') {
        res.status(429).json({ error: error.message });
      } else {
        res.status(500).json({ error: '创建用户失败' });
      }
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const user = await this.userService.update(id, req.body);
      if (user) {
        // 不返回密码
        const { userPassword, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ error: '用户不存在' });
      }
    } catch (error) {
      res.status(500).json({ error: '更新用户失败' });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      await this.userService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: '删除用户失败' });
    }
  };

  /**
   * 用户登录
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userAccount, userPassword } = req.body;
      
      // 验证参数
      if (!userAccount || !userPassword) {
        res.status(400).json({ success: false, message: '账号和密码不能为空' });
        return;
      }

      // 查找用户
      const user = await this.userService.findByAccount(userAccount);
      if (!user) {
        res.status(401).json({ success: false, message: '用户名或密码错误' });
        return;
      }
      
      // 验证密码
      const isValidPassword = await PasswordUtil.verifyPassword(userPassword, user.userPassword);
      if (!isValidPassword) {
        res.status(401).json({ success: false, message: '用户名或密码错误' });
        return;
      }

      // 更新最后登录时间
      await this.userService.updateLastLoginTime(user.id!);

      // 生成JWT令牌
      const token = JwtUtil.generateToken({ userId: user.id!, userAccount: user.userAccount! });

      // 存储到Redis
      await RedisUtil.storeUserSession(user.id!, token);

      // 将用户信息存储在请求对象中
      const authReq = req as AuthenticatedRequest;
      authReq.user = {
        id: user.id!,
        userType: user.userType as UserType,
        userAccount: user.userAccount!
      };
      
      res.json({ 
        success: true, 
        message: '登录成功',
        user: {
          id: user.id,
          userAccount: user.userAccount,
          userName: user.userName,
          userType: user.userType
        },
        token
      });
    } catch (error) {
      res.status(500).json({ success: false, message: '登录失败' });
    }
  };

  /**
   * 获取当前用户信息
   */
  getCurrentUser = (req: Request, res: Response): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (authReq.user) {
      res.json({ success: true, user: authReq.user });
    } else {
      res.status(401).json({ success: false, message: '未登录' });
    }
  };

  /**
   * 用户登出
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // 从请求头获取令牌
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        res.status(401).json({ success: false, message: '未提供令牌' });
        return;
      }

      // 验证令牌
      const decoded = JwtUtil.verifyToken(token);
      if (!decoded || !decoded.userId) {
        res.status(401).json({ success: false, message: '无效的令牌' });
        return;
      }

      // 从Redis中删除会话
      await RedisUtil.removeUserSession(decoded.userId);

      // 清除请求对象中的用户信息
      const authReq = req as AuthenticatedRequest;
      authReq.user = undefined;

      res.json({ success: true, message: '登出成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: '登出失败' });
    }
  };


};

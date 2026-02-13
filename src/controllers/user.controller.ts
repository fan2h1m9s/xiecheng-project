import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { PasswordUtil } from '../utils/password.util';
import { JwtUtil } from '../utils/jwt.util';
import { RedisUtil } from '../utils/redis.util';

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


}

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

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
        res.json(user);
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
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: '创建用户失败' });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const user = await this.userService.update(id, req.body);
      if (user) {
        res.json(user);
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

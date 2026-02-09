import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserType } from '../enums/user-type.enum';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 用户登录
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userAccount, userPassword } = req.body;
      
      // 简单的用户验证（实际项目中应该使用密码加密）
      const user = await this.userService.findByAccount(userAccount);
      
      if (user && user.userPassword === userPassword) {
        // 模拟登录成功，将用户信息存储在请求对象中
        // 实际项目中应该使用 JWT 等方式
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
          }
        });
      } else {
        res.status(401).json({ success: false, message: '用户名或密码错误' });
      }
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
  logout = (req: Request, res: Response): void => {
    const authReq = req as AuthenticatedRequest;
    authReq.user = undefined;
    res.json({ success: true, message: '登出成功' });
  };
}

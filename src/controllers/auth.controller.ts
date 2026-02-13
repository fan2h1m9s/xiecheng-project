import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserType } from '../enums/user-type.enum';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PasswordUtil } from '../utils/password.util';
import { JwtUtil } from '../utils/jwt.util';
import { RedisUtil } from '../utils/redis.util';

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
      
      // 验证参数
      if (!userAccount) {
        res.status(400).json({ success: false, message: '账号不能为空' });
        return;
      }
      if (!userPassword) {
        res.status(400).json({ success: false, message: '密码不能为空' });
        return;
      }

      // 查找用户
      const user = await this.userService.findByAccount(userAccount);
      if (!user) {
        res.status(401).json({ success: false, message: '用户名错误' });
        return;
      }
      
      // 验证密码
      const isValidPassword = await PasswordUtil.verifyPassword(userPassword, user.userPassword);
      if (!isValidPassword) {
        res.status(401).json({ success: false, message: '密码错误' });
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
      const token = req.headers.authorization?.replace(' ', '');
      if (!token) {
        res.status(401).json({ success: false, message: '无法进行身份认证' });
        return;
      }

      // 验证令牌
      const decoded = JwtUtil.verifyToken(token);
      if (!decoded || !decoded.userId) {
        res.status(401).json({ success: false, message: '无效的认证令牌' });
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
}

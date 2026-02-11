import { Request, Response, NextFunction } from 'express';
import { UserType } from '../enums/user-type.enum';
import { Hotel } from '../entities/Hotel';
import { AppDataSource } from '../config/typeorm.config';
import { JwtUtil } from '../utils/jwt.util';
import { RedisUtil } from '../utils/redis.util';
import { UserService } from '../services/user.service';

// 认证请求接口
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userType: UserType;
    userAccount: string;
  };
}

/**
 * JWT认证中间件
 * 验证请求头中的Authorization令牌
 */
export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    // 从请求头获取Authorization令牌
    const authHeader = req.headers.authorization;
    
    // 检查是否存在令牌
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 对于需要认证的路由，后续的requireAuth中间件会处理未登录情况
      // 对于公开路由，允许继续访问
      return next();
    }
    
    // 提取令牌
    const token = authHeader.replace('Bearer ', '');
    
    // 验证令牌
    const decoded = JwtUtil.verifyToken(token);
    if (!decoded || !decoded.userId) {
      // 令牌无效，继续执行，后续的requireAuth会处理
      return next();
    }
    
    // 检查Redis中的会话状态
    const storedToken = await RedisUtil.getUserSession(decoded.userId);
    if (!storedToken || storedToken !== token) {
      // 会话不存在或令牌不匹配，继续执行
      return next();
    }
    
    // 获取用户信息
    const userService = new UserService();
    const user = await userService.findOne(decoded.userId);
    
    if (user) {
      // 将用户信息存储到请求对象中
      const authReq = req as AuthenticatedRequest;
      authReq.user = {
        id: user.id!,
        userType: user.userType as UserType,
        userAccount: user.userAccount!
      };
    }
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    // 认证错误不阻止请求，后续的requireAuth会处理
    next();
  }
}

/**
 * 权限检查中间件
 * @param requiredTypes 需要的用户类型数组
 */
export function requireAuth(...requiredTypes: UserType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    // 检查用户是否登录
    if (!authReq.user) {
      return res.status(401).json({ error: '未登录' });
    }
    
    // 检查用户权限
    if (!requiredTypes.includes(authReq.user.userType)) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    next();
  };
}

/**
 * 检查酒店所有权中间件
 * 确保酒店管理员只能管理自己所属的酒店
 */
export function requireHotelOwnership() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    // 系统管理员可以管理所有酒店
    if (authReq.user?.userType === UserType.SYSTEM_ADMIN) {
      return next();
    }
    
    // 酒店管理员只能管理自己所属的酒店
    if (authReq.user?.userType === UserType.HOTEL_ADMIN) {
      const hotelId = parseInt(req.params.id as string);
      const hotelRepository = AppDataSource.getRepository(Hotel);
      const hotel = await hotelRepository.findOneBy({ id: hotelId });
      
      if (!hotel) {
        return res.status(404).json({ error: '酒店不存在' });
      }
      
      if (hotel.userId !== authReq.user.id) {
        return res.status(403).json({ error: '无权管理该酒店' });
      }
      
      return next();
    }
    
    return res.status(403).json({ error: '权限不足' });
  };
}

/**
 * 普通用户权限中间件
 * 适用于需要登录的普通操作
 */
export const requireNormalUser = requireAuth(UserType.NORMAL_USER);

/**
 * 酒店管理员权限中间件
 * 适用于酒店管理操作
 */
export const requireHotelAdmin = requireAuth(UserType.HOTEL_ADMIN);

/**
 * 系统管理员权限中间件
 * 适用于系统管理操作
 */
export const requireSystemAdmin = requireAuth(UserType.SYSTEM_ADMIN);

/**
 * 酒店管理员或系统管理员权限中间件
 * 适用于需要管理权限的操作
 */
export const requireHotelOrSystemAdmin = requireAuth(
  UserType.HOTEL_ADMIN,
  UserType.SYSTEM_ADMIN
);

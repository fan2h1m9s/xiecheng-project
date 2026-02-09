import { Request, Response, NextFunction } from 'express';
import { UserType } from '../enums/user-type.enum';
import { Hotel } from '../entities/Hotel';
import { AppDataSource } from '../config/typeorm.config';

// 模拟用户登录状态的接口
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userType: UserType;
    userAccount: string;
  };
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
 */
export const requireNormalUser = requireAuth(UserType.NORMAL_USER);

/**
 * 酒店管理员权限中间件
 */
export const requireHotelAdmin = requireAuth(UserType.HOTEL_ADMIN);

/**
 * 系统管理员权限中间件
 */
export const requireSystemAdmin = requireAuth(UserType.SYSTEM_ADMIN);

/**
 * 酒店管理员或系统管理员权限中间件
 */
export const requireHotelOrSystemAdmin = requireAuth(
  UserType.HOTEL_ADMIN,
  UserType.SYSTEM_ADMIN
);

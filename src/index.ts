import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from './config/typeorm.config';
import userRoutes from './routes/user.routes';
import hotelRoutes from './routes/hotel.routes';
import roomRoutes from './routes/room.routes';
import orderRoutes from './routes/order.routes';
import authRoutes from './routes/auth.routes';
import { UserType } from './enums/user-type.enum';
import { AuthenticatedRequest } from './middleware/auth.middleware';
import { initializeRedis } from './config/redis.config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模拟用户登录状态的中间件（实际项目中应该使用 JWT 等方式）
app.use((req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  
  // 从请求头中获取用户类型，用于测试
  const userTypeStr = req.headers['x-user-type'];
  const userAccount = req.headers['x-user-account'] as string;
  
  if (userTypeStr && userAccount) {
    const userType = parseInt(userTypeStr as string);
    authReq.user = {
      id: 1,
      userType: userType as UserType,
      userAccount
    };
  }
  
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: '酒店后端服务已启动' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/orders', orderRoutes);

const startServer = async () => {
  try {
    // 初始化数据库连接
    await AppDataSource.initialize();
    console.log('数据库连接成功');
    
    // 初始化Redis连接
    await initializeRedis();
    
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

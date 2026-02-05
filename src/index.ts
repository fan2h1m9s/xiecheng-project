import express, { Request, Response } from 'express';
import { testConnection } from './config/database';
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基本路由
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '酒店后端服务已启动' });
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  // 测试数据库连接
  await testConnection();
});

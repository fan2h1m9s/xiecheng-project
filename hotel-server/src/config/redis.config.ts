import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config({ override: true });

/**
 * Redis客户端配置
 */
const host = '127.0.0.1';
const port = 6379;

export const redisClient = createClient({
  socket: {
    host,
    port,
    connectTimeout: 3000
  }
});

redisClient.on('error', (error) => {
  console.error('Redis客户端错误:', error);
});

/**
 * 初始化Redis连接
 */
export const initializeRedis = async (): Promise<void> => {
  try {
    console.log(`Redis连接中: ${host}:${port}`);
    await redisClient.connect();
    console.log('Redis连接成功');
  } catch (error) {
    console.error('Redis连接失败:', error);
    // Redis连接失败不影响服务器启动，仅作为警告
  }
};

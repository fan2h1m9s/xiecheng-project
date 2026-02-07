import { createClient } from 'redis';

/**
 * Redis客户端配置
 */
const ipAddress = '192.168.19.128';

export const redisClient = createClient({
  url: `redis://${ipAddress}:6379` // Redis服务器地址
});

/**
 * 初始化Redis连接
 */
export const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Redis连接成功');
  } catch (error) {
    console.error('Redis连接失败:', error);
    // Redis连接失败不影响服务器启动，仅作为警告
  }
};

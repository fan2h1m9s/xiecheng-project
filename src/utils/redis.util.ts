import { redisClient } from '../config/redis.config';

/**
 * Redis工具类
 */
export class RedisUtil {
  /**
   * 检查Redis连接状态
   */
  static isConnected(): boolean {
    return redisClient.isOpen;
  }

  /**
   * 存储用户会话信息
   * @param userId 用户ID
   * @param token JWT令牌
   * @param expiration 过期时间（秒）
   */
  static async storeUserSession(userId: number, token: string, expiration: number = 86400): Promise<void> {
    if (!this.isConnected()) {
      console.warn('Redis未连接，跳过会话存储');
      return;
    }

    try {
      await redisClient.set(`user:${userId}:token`, token, { EX: expiration });
    } catch (error) {
      console.error('存储用户会话失败:', error);
    }
  }

  /**
   * 获取用户会话信息
   * @param userId 用户ID
   * @returns JWT令牌
   */
  static async getUserSession(userId: number): Promise<string | null> {
    if (!this.isConnected()) {
      console.warn('Redis未连接，跳过会话获取');
      return null;
    }

    try {
      return await redisClient.get(`user:${userId}:token`);
    } catch (error) {
      console.error('获取用户会话失败:', error);
      return null;
    }
  }

  /**
   * 删除用户会话信息
   * @param userId 用户ID
   */
  static async removeUserSession(userId: number): Promise<void> {
    if (!this.isConnected()) {
      console.warn('Redis未连接，跳过会话删除');
      return;
    }

    try {
      await redisClient.del(`user:${userId}:token`);
    } catch (error) {
      console.error('删除用户会话失败:', error);
    }
  }

  /**
   * 获取分布式锁
   * @param key 锁的键
   * @param value 锁的值
   * @param expiration 过期时间（秒）
   * @returns 是否获取到锁
   */
  static async getLock(key: string, value: string, expiration: number = 10): Promise<boolean> {
    if (!this.isConnected()) {
      console.warn('Redis未连接，跳过锁获取');
      return true; // Redis未连接时，允许操作继续
    }

    try {
      // 使用SET NX命令获取锁，确保原子操作
      const result = await redisClient.set(key, value, {
        NX: true,
        EX: expiration
      });
      return result === 'OK';
    } catch (error) {
      console.error('获取锁失败:', error);
      return true; // 锁获取失败时，允许操作继续
    }
  }

  /**
   * 释放分布式锁
   * @param key 锁的键
   * @param value 锁的值
   */
  static async releaseLock(key: string, value: string): Promise<void> {
    if (!this.isConnected()) {
      console.warn('Redis未连接，跳过锁释放');
      return;
    }

    try {
      // 使用Lua脚本释放锁，确保原子操作
      const script = `
        if redis.call('get', KEYS[1]) == ARGV[1] then
          return redis.call('del', KEYS[1])
        else
          return 0
        end
      `;
      await redisClient.eval(script, { keys: [key], arguments: [value] });
    } catch (error) {
      console.error('释放锁失败:', error);
    }
  }
}

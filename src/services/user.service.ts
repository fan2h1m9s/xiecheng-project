import {Repository} from 'typeorm';
import {AppDataSource} from '../config/typeorm.config';
import {User} from '../entities/User';
import {PasswordUtil} from '../utils/password.util';
import {RedisUtil} from '../utils/redis.util';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByAccount(userAccount: string): Promise<User | null> {
    return this.userRepository.findOneBy({ userAccount });
  }

  async create(userData: Partial<User>): Promise<User> {
    // 检查账号是否已存在
    if (userData.userAccount) {
      const existingUser = await this.findByAccount(userData.userAccount);
      if (existingUser) {
        throw new Error('账号已存在');
      }

      // 验证用户类型，禁止创建系统管理员账号
      if (userData.userType === 2) {
        throw new Error('禁止创建系统管理员账号');
      }

      // 生成锁的键和值
      const lockKey = `lock:register:${userData.userAccount}`;
      const lockValue = `${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

      try {
        // 获取分布式锁
        const acquired = await RedisUtil.getLock(lockKey, lockValue);
        if (!acquired) {
          throw new Error('注册请求处理中，请稍后重试');
        }

        // 再次检查账号是否已存在（防止在获取锁的过程中其他请求已创建用户）
        const checkUser = await this.findByAccount(userData.userAccount);
        if (checkUser) {
          throw new Error('账号已存在');
        }

        // 对密码进行加密
        if (userData.userPassword) {
          userData.userPassword = await PasswordUtil.hashPassword(userData.userPassword);
        }
        // 设置注册时间
        userData.registerTime = new Date();
        
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
      } finally {
        // 释放分布式锁
        await RedisUtil.releaseLock(lockKey, lockValue);
      }
    } else {
      throw new Error('账号不能为空');
    }
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    // 验证用户类型，禁止更新为系统管理员账号
    if (userData.userType === 2) {
      throw new Error('禁止设置系统管理员账号');
    }

    // 如果更新密码，需要重新加密
    if (userData.userPassword) {
      userData.userPassword = await PasswordUtil.hashPassword(userData.userPassword);
    }
    
    await this.userRepository.update(id, userData);
    return this.userRepository.findOneBy({ id });
  }

  async updateLastLoginTime(id: number): Promise<void> {
    await this.userRepository.update(id, { lastLoginTime: new Date() });
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}

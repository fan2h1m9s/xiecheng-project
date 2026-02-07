import * as bcrypt from 'bcrypt';

/**
 * 密码加密工具类
 */
export class PasswordUtil {
  /**
   * 加密密码
   * @param password 原始密码
   * @returns 加密后的密码
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * 验证密码
   * @param password 原始密码
   * @param hashedPassword 加密后的密码
   * @returns 密码是否匹配
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

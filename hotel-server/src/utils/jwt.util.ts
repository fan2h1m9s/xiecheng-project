import * as jwt from 'jsonwebtoken';

/**
 * JWT工具类
 */
export class JwtUtil {
  // JWT密钥，实际项目中应存储在环境变量中
  private static readonly SECRET_KEY = 'abcdefghijklmnopqrstuvwxyz';
  // JWT过期时间（24小时）
  private static readonly EXPIRATION_TIME = '24h';

  /**
   * 生成JWT令牌
   * @param payload 令牌载荷
   * @returns JWT令牌
   */
  static generateToken(payload: any): string {
    return jwt.sign(payload, this.SECRET_KEY, { expiresIn: this.EXPIRATION_TIME });
  }

  /**
   * 验证JWT令牌
   * @param token JWT令牌
   * @returns 令牌是否有效
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.SECRET_KEY);
    } catch (error) {
      return null;
    }
  }
}

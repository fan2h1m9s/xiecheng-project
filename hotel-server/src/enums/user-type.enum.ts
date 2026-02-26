export enum UserType {
  /** 普通用户 */
  NORMAL_USER = 0,
  /** 酒店管理员 */
  HOTEL_ADMIN = 1,
  /** 系统管理员 */
  SYSTEM_ADMIN = 2
}

export const userTypeMap = {
  [UserType.NORMAL_USER]: '普通用户',
  [UserType.HOTEL_ADMIN]: '酒店管理员',
  [UserType.SYSTEM_ADMIN]: '系统管理员'
};

export function getUserTypeText(type: UserType): string {
  return userTypeMap[type] || '未知用户类型';
}

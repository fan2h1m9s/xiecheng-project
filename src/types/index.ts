// 用户类型：0-普通用户, 1-酒店管理员, 2-系统管理员
export enum UserType {
  NORMAL_USER = 0,
  HOTEL_ADMIN = 1,
  SYSTEM_ADMIN = 2,
}

// 酒店状态：0-待审核, 1-已通过, 2-已拒绝, 3-已禁用
export enum HotelStatus {
  PENDING_APPROVAL = 0,
  APPROVED = 1,
  REJECTED = 2,
  DISABLED = 3,
}

export interface User {
  id: number
  userAccount: string
  userName?: string
  userType: UserType
  userPhone?: string
  userEmail?: string
  registerTime?: string
  lastLoginTime?: string
}

export interface Hotel {
  id: number
  hotelNameZh?: string
  hotelNameEn?: string
  hotelAddress?: string
  hotelStars?: number
  hotelTele?: string
  hotelDis?: string
  hotelOpeningTime?: string
  earliestCheckIn?: string
  latestCheckOut?: string
  hotelStatus?: HotelStatus
  hotelRemark?: string
  userId?: number
}

export interface RoomType {
  id: number
  roomTypeName: string
  roomTypeDescription?: string
  roomTypePrice?: number
  hotelId: number
}

export interface Room {
  id: number
  roomNumber: string
  roomName?: string
  roomStatus?: number
  roomTypeId: number
  roomArea?: number
}

export interface LoginForm {
  userAccount: string
  userPassword: string
}

export interface RegisterForm {
  userAccount: string
  userPassword: string
  confirmPassword: string
  userName?: string
  userType: UserType
}

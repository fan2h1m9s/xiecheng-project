export enum HotelStatus {
  /** 待审核 */
  PENDING_APPROVAL = 0,
  /** 已通过 */
  APPROVED = 1,
  /** 已拒绝 */
  REJECTED = 2,
  /** 已禁用 */
  DISABLED = 3
}

export const hotelStatusMap = {
  [HotelStatus.PENDING_APPROVAL]: '待审核',
  [HotelStatus.APPROVED]: '已通过',
  [HotelStatus.REJECTED]: '已拒绝',
  [HotelStatus.DISABLED]: '已禁用'
};

export function getHotelStatusText(status: HotelStatus): string {
  return hotelStatusMap[status] || '未知酒店状态';
}

export enum RoomStatus {
  /** 空闲 */
  AVAILABLE = 0,
  /** 已入住 */
  OCCUPIED = 1,
  /** 已退房 */
  CHECKED_OUT = 2
}

export const roomStatusMap = {
  [RoomStatus.AVAILABLE]: '空闲',
  [RoomStatus.OCCUPIED]: '已入住',
  [RoomStatus.CHECKED_OUT]: '已退房'
};

export function getRoomStatusText(status: RoomStatus): string {
  return roomStatusMap[status] || '未知房间状态';
}

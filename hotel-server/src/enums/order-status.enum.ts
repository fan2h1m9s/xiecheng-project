export enum OrderStatus {
  /** 待付款 */
  PENDING_PAYMENT = 0,
  /** 已付款，待入住 */
  PAID_PENDING_CHECK_IN = 1,
  /** 已入住，待退房 */
  CHECKED_IN_PENDING_CHECK_OUT = 2,
  /** 已退房 */
  CHECKED_OUT = 3,
  /** 已取消 */
  CANCELLED = 4
}

export const orderStatusMap = {
  [OrderStatus.PENDING_PAYMENT]: '待付款',
  [OrderStatus.PAID_PENDING_CHECK_IN]: '已付款，待入住',
  [OrderStatus.CHECKED_IN_PENDING_CHECK_OUT]: '已入住，待退房',
  [OrderStatus.CHECKED_OUT]: '已退房',
  [OrderStatus.CANCELLED]: '已取消'
};

export function getOrderStatusText(status: OrderStatus): string {
  return orderStatusMap[status] || '未知订单状态';
}

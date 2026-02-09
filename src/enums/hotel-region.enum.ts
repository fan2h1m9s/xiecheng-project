export enum HotelRegion {
  /** 国内 */
  DOMESTIC = 0,
  /** 国际 */
  INTERNATIONAL = 1
}

export const hotelRegionMap = {
  [HotelRegion.DOMESTIC]: '国内',
  [HotelRegion.INTERNATIONAL]: '国际'
};

export function getHotelRegionText(region: HotelRegion): string {
  return hotelRegionMap[region] || '未知区域';
}

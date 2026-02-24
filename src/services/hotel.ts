import { request } from './request'

export type HotelApiItem = {
  id: number
  hotelNameZh?: string
  hotelNameEn?: string
  hotelAddress?: string
  hotelStars?: number
  hotelDis?: string
  hotelTele?: string
  latitude?: number | string
  longitude?: number | string
}

export async function getHotels() {
  return request<HotelApiItem[]>({
    url: '/api/hotels',
    method: 'GET'
  })
}

export async function getHotelById(id: number) {
  return request<HotelApiItem>({
    url: `/api/hotels/${id}`,
    method: 'GET'
  })
}

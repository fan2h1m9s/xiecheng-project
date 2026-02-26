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

export type RoomTypeApiItem = {
  id: number
  roomTypeName: string
  roomTypePrice: string | number
  roomTypeDis?: string
  roomTypeRest?: number
  hotelId: number
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

export async function getAllRoomTypes() {
  return request<RoomTypeApiItem[]>({
    url: '/api/rooms/types/all',
    method: 'GET'
  })
}

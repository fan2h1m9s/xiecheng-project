import request from '@/utils/request'
import { Hotel } from '@/types'

export const getHotels = () => {
  return request.get<any, Hotel[]>('/hotels')
}

export const getHotelById = (id: number) => {
  return request.get<any, Hotel>(`/hotels/${id}`)
}

export const createHotel = (data: Partial<Hotel>) => {
  return request.post<any, Hotel>('/hotels', data)
}

export const updateHotel = (id: number, data: Partial<Hotel>) => {
  return request.put<any, Hotel>(`/hotels/${id}`, data)
}

export const deleteHotel = (id: number) => {
  return request.delete(`/hotels/${id}`)
}

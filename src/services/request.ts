import Taro from '@tarojs/taro'
import { API_BASE_URL } from '../config/api'

const DEBUG_HTTP = typeof process !== 'undefined' && process.env
  ? process.env.NODE_ENV !== 'production'
  : true

const debugLog = (...args: any[]) => {
  if (!DEBUG_HTTP) return
  console.log('[HotelFlow][Request]', ...args)
}

type RequestOptions = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
}

export async function request<T>({ url, method = 'GET', data }: RequestOptions): Promise<T> {
  const token = Taro.getStorageSync('token')
  const fullUrl = `${API_BASE_URL}${url}`
  const headers: Record<string, string> = {
    'content-type': 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  debugLog('request start', {
    method,
    url: fullUrl,
    hasToken: Boolean(token),
    data
  })

  const response = await Taro.request<T | { error?: string; message?: string }>({
    url: fullUrl,
    method,
    data,
    header: headers,
    timeout: 10000
  })

  const { statusCode } = response
  debugLog('request response', {
    method,
    url: fullUrl,
    statusCode,
    data: response.data
  })

  if (statusCode >= 200 && statusCode < 300) {
    return response.data as T
  }

  const errorBody = response.data as { error?: string; message?: string }
  const message = errorBody?.error || errorBody?.message || `请求失败(${statusCode})`
  throw new Error(message)
}

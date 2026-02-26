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

  let response: Taro.request.SuccessCallbackResult<T | { error?: string; message?: string }>
  try {
    response = await Taro.request<T | { error?: string; message?: string }>({
      url: fullUrl,
      method,
      data,
      header: headers,
      timeout: 10000
    })
  } catch (error: any) {
    const errMsg = (error && error.errMsg) || ''
    const usingLocalhost = /127\.0\.0\.1|localhost/.test(API_BASE_URL)
    const refused = /ERR_CONNECTION_REFUSED/.test(errMsg)
    if (usingLocalhost && refused) {
      throw new Error('真机无法访问127.0.0.1。请将 TARO_APP_API_BASE_URL 设置为电脑局域网地址（如 http://192.168.x.x:3000），并确保后端监听 0.0.0.0。')
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error(errMsg || '网络请求失败')
  }

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
  const message = (errorBody && errorBody.error) || (errorBody && errorBody.message) || `请求失败(${statusCode})`
  throw new Error(message)
}

import axios from 'axios'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    // 如果响应有 success 字段且为 false，显示错误信息
    if (response.data && response.data.success === false) {
      message.error(response.data.message || '操作失败')
      return Promise.reject(new Error(response.data.message || '操作失败'))
    }
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      message.error('登录已过期，请重新登录')
    } else if (error.response?.data?.error) {
      message.error(error.response.data.error)
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message)
    } else {
      message.error('请求失败')
    }
    return Promise.reject(error)
  }
)

export default request

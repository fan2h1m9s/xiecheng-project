import request from '@/utils/request'
import { LoginForm, RegisterForm, User } from '@/types'

export const login = (data: LoginForm) => {
  return request.post<any, { user: User; token: string }>('/users/login', data)
}

export const register = (data: Omit<RegisterForm, 'confirmPassword'>) => {
  return request.post<any, { user: User; token: string }>('/users/register', data)
}

export const getCurrentUser = () => {
  return request.get<any, { success: boolean; user: User }>('/users/me')
}

export const logout = () => {
  return request.post<any, { success: boolean; message: string }>('/users/logout')
}

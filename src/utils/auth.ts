import { User } from '@/types'

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const setUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user))
  if (user.token) {
    localStorage.setItem('token', user.token)
  }
}

export const clearUser = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token')
}

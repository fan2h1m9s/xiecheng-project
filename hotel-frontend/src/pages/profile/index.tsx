import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 每次页面显示时读取登录信息
  useDidShow(() => {
    try {
      const stored = Taro.getStorageSync('user')
      if (stored) setCurrentUser(stored)
      else setCurrentUser(null)
    } catch (e) {
      setCurrentUser(null)
    }
  })

  // 处理登出
  const handleLogout = () => {
    Taro.showModal({
      title: '确认登出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('user')
          Taro.removeStorageSync('token')
          setCurrentUser(null)
          Taro.showToast({ title: '登出成功', icon: 'success' })
        }
      }
    })
  }

  // 处理登录
  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' })
  }

  // 处理修改个人信息
  const handleEditProfile = () => {
    Taro.showToast({ title: '修改个人信息功能开发中', icon: 'none' })
  }

  // 处理查看订单
  const handleViewOrders = () => {
    Taro.showToast({ title: '订单管理功能开发中', icon: 'none' })
  }

  // 处理查看收藏
  const handleViewFavorites = () => {
    Taro.showToast({ title: '收藏管理功能开发中', icon: 'none' })
  }

  // 处理查看优惠券
  const handleViewCoupons = () => {
    Taro.showToast({ title: '优惠券功能开发中', icon: 'none' })
  }

  return (
    <View className='profile-page'>
      {currentUser ? (
        // 已登录状态
        <View className='user-profile'>
          {/* 顶部用户信息区域 */}
          <View className='profile-header'>
            <View className='avatar'>
              <Text className='avatar-text'>{currentUser.account.charAt(0).toUpperCase()}</Text>
            </View>
            <View className='user-info'>
              <Text className='user-name'>{currentUser.userName || currentUser.account}</Text>
              <Text className='user-role'>
                {currentUser.role === 'hotel' ? '酒店管理员' : '普通用户'}
              </Text>
            </View>
          </View>
          
          {/* 账号信息区 */}
          <View className='profile-section'>
            <Text className='section-title'>账号信息</Text>
            <View className='info-item'>
              <Text className='info-label'>账号</Text>
              <Text className='info-value'>{currentUser.account}</Text>
            </View>
            <View className='info-item'>
              <Text className='info-label'>用户类型</Text>
              <Text className='info-value'>
                {currentUser.userType === 1 ? '普通用户' : 
                 currentUser.userType === 2 ? '系统管理员' : '酒店管理员'}
              </Text>
            </View>
            <View className='info-item'>
              <Text className='info-label'>登录时间</Text>
              <Text className='info-value'>
                {new Date(currentUser.loginTime).toLocaleString()}
              </Text>
            </View>
          </View>
          
          {/* 退出登录按钮 */}
          <View className='profile-actions'>
            <Button 
              className='logout-btn' 
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </View>
        </View>
      ) : (
        // 未登录状态
        <View className='login-prompt'>
          <View className='prompt-content'>
            <Text className='prompt-icon'>🔐</Text>
            <Text className='prompt-title'>您还未登录</Text>
            <Text className='prompt-text'>登录后可查看个人信息</Text>
            <Button 
              className='login-btn' 
              onClick={handleLogin}
            >
              立即登录
            </Button>
            <View className='login-tips'>
              <Text className='tip-text'>登录即代表同意《用户协议》和《隐私政策》</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
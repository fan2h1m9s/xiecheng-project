import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { request } from '../../services/request'
import './index.scss'

export default function LoginPage() {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'hotel'>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ account: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // 加载时检查是否有保存的账号
  useEffect(() => {
    const savedAccount = Taro.getStorageSync('savedAccount')
    if (savedAccount) {
      setAccount(savedAccount)
      setRememberMe(true)
    }
  }, [])

  // 表单验证
  const validateForm = () => {
    const newErrors: any = { account: '', password: '', confirmPassword: '', phone: '', email: '' }
    let isValid = true

    if (!account.trim()) {
      newErrors.account = '请输入账号'
      isValid = false
    } else if (account.length < 3) {
      newErrors.account = '账号长度不能小于3位'
      isValid = false
    }

    if (!password) {
      newErrors.password = '请输入密码'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = '密码长度不能小于6位'
      isValid = false
    }

    if (isRegister) {
      if (!confirmPassword) {
        newErrors.confirmPassword = '请再次输入密码'
        isValid = false
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }

      // 简单手机号校验（可扩展）
      if (phone && !/^\d{6,15}$/.test(phone)) {
        newErrors.phone = '请输入有效手机号或留空'
        isValid = false
      }

      // 简单邮箱校验
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        newErrors.email = '请输入有效邮箱或留空'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // 处理登录
  const handleLogin = async () => {
    if (loading) return
    
    if (!validateForm()) {
      Taro.showToast({ 
        title: '请完善登录信息',
        icon: 'none',
        duration: 2000
      })
      return
    }

    setLoading(true)

    try {
      // 调用后端登录接口
      const response = await request<{
        success: boolean
        message: string
        user: {
          id: number
          userAccount: string
          userName: string
          userType: number
        }
        token: string
      }>({
        url: '/api/users/login',
        method: 'POST',
        data: {
          userAccount: account,
          userPassword: password
        }
      })

      // 保存用户信息和token
      const user = {
        id: response.user.id,
        account: response.user.userAccount,
        userName: response.user.userName,
        role: response.user.userType === 3 ? 'hotel' : 'user',
        userType: response.user.userType,
        loginTime: new Date().toISOString()
      }
      
      Taro.setStorageSync('user', user)
      Taro.setStorageSync('token', response.token)
      
      // 记住账号功能
      if (rememberMe) {
        Taro.setStorageSync('savedAccount', account)
      } else {
        Taro.removeStorageSync('savedAccount')
      }

      Taro.showToast({
        title: response.message || '登录成功',
        icon: 'success',
        duration: 1500
      })

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        Taro.reLaunch({ 
          url: '/pages/index/index',
          success: () => {
            setLoading(false)
          }
        })
      }, 1500)

    } catch (error: any) {
      setLoading(false)
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'error',
        duration: 2000
      })
    }
  }

  // 处理注册
  const handleRegister = async () => {
    if (loading) return

    if (!validateForm()) {
      Taro.showToast({ title: '请完善注册信息', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 调用后端注册接口
      const response = await request<{
        user: {
          id: number
          userAccount: string
          userName: string
          userType: number
        }
        token: string
      }>({
        url: '/api/users/register',
        method: 'POST',
        data: {
          userAccount: account,
          userPassword: password,
          userName: account, // 使用账号作为默认用户名
          userType: role === 'hotel' ? 3 : 1 // 1: 普通用户, 3: 酒店管理员
        }
      })

      // 保存用户信息和token
      const user = {
        id: response.user.id,
        account: response.user.userAccount,
        userName: response.user.userName,
        role: response.user.userType === 3 ? 'hotel' : 'user',
        userType: response.user.userType,
        loginTime: new Date().toISOString()
      }
      
      Taro.setStorageSync('user', user)
      Taro.setStorageSync('token', response.token)

      Taro.showToast({ title: '注册并登录成功', icon: 'success' })
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/index/index' })
      }, 800)
    } catch (error: any) {
      setLoading(false)
      if (error.message === '账号已存在') {
        setErrors((prev: any) => ({ ...prev, account: '该账号已被注册' }))
      }
      Taro.showToast({ title: error.message || '注册失败，请重试', icon: 'none' })
    }
  }

  // 处理输入变化
  const handleAccountChange = (e) => {
    setAccount(e.detail.value)
    if (errors.account) setErrors(prev => ({ ...prev, account: '' }))
  }

  const handlePasswordChange = (e) => {
    setPassword(e.detail.value)
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
  }

  const handleConfirmChange = (e) => {
    setConfirmPassword(e.detail.value)
    if ((errors as any).confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
  }

  const handlePhoneChange = (e) => {
    setPhone(e.detail.value)
    if ((errors as any).phone) setErrors(prev => ({ ...prev, phone: '' }))
  }

  const handleEmailChange = (e) => {
    setEmail(e.detail.value)
    if ((errors as any).email) setErrors(prev => ({ ...prev, email: '' }))
  }

  // 快速登录
  const quickLogin = (type) => {
    Taro.showToast({
      title: `使用${type}登录`,
      icon: 'none',
      duration: 1500
    })
  }

  return (
    <View className='login-page'>
      {/* 已删除返回按钮 */}

      <View className='login-card'>
        <View className='logo-area'>
          <View className='logo'>易宿</View>
          <Text className='subtitle'>欢迎使用易宿酒店预订</Text>
        </View>

        {/* 登录 / 注册 切换 */}
        <View className='tab-row'>
          <View className={`tab-btn ${!isRegister ? 'active' : ''}`} onClick={() => setIsRegister(false)} hoverClass='none'>登录</View>
          <View className={`tab-btn ${isRegister ? 'active' : ''}`} onClick={() => setIsRegister(true)} hoverClass='none'>注册</View>
        </View>

        <View className='form'>
          {/* 账号输入 */}
          <View className='field'>
            <Text className='label'>用户名 / 手机号</Text>
            <Input
              className={`input ${errors.account ? 'error' : ''}`}
              value={account}
              placeholder='请输入用户名或手机号'
              onInput={handleAccountChange}
              maxlength={20}
              confirmType='next'
            />
            {errors.account && (
              <Text className='error-message'>{errors.account}</Text>
            )}
          </View>

          {/* 密码输入 */}
          <View className='field'>
            <Text className='label'>密码</Text>
            <View className='password-row'>
              <Input
                className={`input password-input ${errors.password ? 'error' : ''}`}
                password={!showPassword}
                value={password}
                placeholder='请输入密码'
                onInput={handlePasswordChange}
                maxlength={20}
                confirmType='done'
                onConfirm={handleLogin}
              />
              <View 
                className='toggle' 
                onClick={() => setShowPassword(!showPassword)}
                hoverClass='none'
              >
                {showPassword ? '隐藏' : '显示'}
              </View>
            </View>
            {errors.password && (
              <Text className='error-message'>{errors.password}</Text>
            )}
          </View>

          {/* 注册额外字段：确认密码 / 手机 / 邮箱 */}
          {isRegister && (
            <>
              <View className='field'>
                <Text className='label'>确认密码</Text>
                <Input
                  className={`input ${(errors as any).confirmPassword ? 'error' : ''}`}
                  password={!showPassword}
                  value={confirmPassword}
                  placeholder='请再次输入密码'
                  onInput={handleConfirmChange}
                  maxlength={20}
                />
                {(errors as any).confirmPassword && (
                  <Text className='error-message'>{(errors as any).confirmPassword}</Text>
                )}
              </View>

              <View className='field'>
                <Text className='label'>手机号 (可选)</Text>
                <Input
                  className={`input ${(errors as any).phone ? 'error' : ''}`}
                  value={phone}
                  placeholder='请输入手机号或留空'
                  onInput={handlePhoneChange}
                  maxlength={20}
                />
                {(errors as any).phone && (
                  <Text className='error-message'>{(errors as any).phone}</Text>
                )}
              </View>

              <View className='field'>
                <Text className='label'>邮箱 (可选)</Text>
                <Input
                  className={`input ${(errors as any).email ? 'error' : ''}`}
                  value={email}
                  placeholder='请输入邮箱或留空'
                  onInput={handleEmailChange}
                  maxlength={64}
                />
                {(errors as any).email && (
                  <Text className='error-message'>{(errors as any).email}</Text>
                )}
              </View>
            </>
          )}

          {/* 记住账号 */}
          <View className='checkbox-row'>
            <View 
              className={`checkbox ${rememberMe ? 'checked' : ''}`}
              onClick={() => setRememberMe(!rememberMe)}
              hoverClass='none'
            >
              {rememberMe && (
                <Text className='checkmark'>✓</Text>
              )}
            </View>
            <Text className='checkbox-text'>记住账号</Text>
          </View>

          {/* 角色选择 */}
          <View className='role-row'>
            <Text className='label'>身份</Text>
            <View className='role-buttons'>
              <View 
                className={`role-btn ${role === 'user' ? 'selected' : ''}`} 
                onClick={() => setRole('user')}
                hoverClass='none'
              >
                用户
              </View>
              <View 
                className={`role-btn ${role === 'hotel' ? 'selected' : ''}`} 
                onClick={() => setRole('hotel')}
                hoverClass='none'
              >
                酒店
              </View>
            </View>
          </View>

          {/* 登录按钮 */}
          <View className='submit-area'>
            <View 
              className={`submit-btn ${loading ? 'loading' : ''} ${(!account || !password) ? 'disabled' : ''}`}
              onClick={isRegister ? handleRegister : handleLogin}
              hoverClass='none'
            >
              {loading ? (isRegister ? '注册中' : '登录中') : (isRegister ? '注册并登录' : '登录')}
            </View>
          </View>

          {/* 提示文字 */}
          <View className='hint-row'>
            <Text className='hint'>
              未注册将自动创建账号。登录即代表同意《用户协议》和《隐私政策》
            </Text>
          </View>

          {/* 快速登录选项 */}
          <View className='quick-login'>
            <Text className='divider'>其他登录方式</Text>
            <View className='quick-icons'>
              <View className='quick-icon' onClick={() => quickLogin('微信')}>微</View>
              <View className='quick-icon' onClick={() => quickLogin('支付宝')}>支</View>
              <View className='quick-icon' onClick={() => quickLogin('手机号')}>📱</View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Select, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { register } from '@/api/auth'
import { setUser } from '@/utils/auth'
import { RegisterForm, UserType } from '@/types'
import './index.css'

export default function Register() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: RegisterForm) => {
    setLoading(true)
    try {
      const { confirmPassword, ...registerData } = values
      const res = await register(registerData)
      setUser({ ...res.user, token: res.token })
      message.success('注册成功')
      navigate('/')
    } catch (error) {
      console.error('注册失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-title">用户注册</h1>
        <Form
          form={form}
          name="register"
          className="register-form"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="userAccount"
            rules={[
              { required: true, message: '请输入用户账号' },
              { min: 3, message: '账号至少3个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户账号"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="userName"
            rules={[{ required: true, message: '请输入用户姓名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户姓名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="userType"
            rules={[{ required: true, message: '请选择用户类型' }]}
          >
            <Select placeholder="选择用户类型" size="large">
              <Select.Option value={UserType.HOTEL_ADMIN}>酒店管理员</Select.Option>
              <Select.Option value={UserType.SYSTEM_ADMIN}>系统管理员</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="userPassword"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['userPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('userPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>
        <div className="login-link">
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  )
}

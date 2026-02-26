import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getUser, clearUser } from '@/utils/auth'
import { UserType } from '@/types'
import './index.css'

const { Header, Content } = AntLayout

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = () => {
    clearUser()
    setUser(null)
    navigate('/login')
  }

  const menuItems = [
    {
      key: '/hotels',
      icon: <HomeOutlined />,
      label: '酒店管理',
    },
  ]

  if (user?.userType === UserType.SYSTEM_ADMIN) {
    menuItems.push({
      key: '/hotels/review',
      icon: <CheckCircleOutlined />,
      label: '酒店审核',
    })
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const getUserTypeText = (type?: UserType) => {
    switch (type) {
      case UserType.SYSTEM_ADMIN:
        return '系统管理员'
      case UserType.HOTEL_ADMIN:
        return '酒店管理员'
      case UserType.NORMAL_USER:
        return '普通用户'
      default:
        return '未知'
    }
  }

  return (
    <AntLayout className="layout">
      <Header className="header">
        <div className="logo">携程酒店管理系统</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />} className="user-btn">
            {user?.userName || user?.userAccount} ({getUserTypeText(user?.userType)})
          </Button>
        </Dropdown>
      </Header>
      <Content className="content">
        <Outlet />
      </Content>
    </AntLayout>
  )
}

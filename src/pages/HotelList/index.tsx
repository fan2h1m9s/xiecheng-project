import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Space, Tag, message, Modal } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getHotels, deleteHotel } from '@/api/hotel'
import { Hotel, HotelStatus, UserType } from '@/types'
import { getUser } from '@/utils/auth'
import type { ColumnsType } from 'antd/es/table'

const statusMap = {
  [HotelStatus.PENDING_APPROVAL]: { text: '待审核', color: 'processing' },
  [HotelStatus.APPROVED]: { text: '已通过', color: 'success' },
  [HotelStatus.REJECTED]: { text: '已拒绝', color: 'error' },
  [HotelStatus.DISABLED]: { text: '已禁用', color: 'warning' },
}

export default function HotelList() {
  const navigate = useNavigate()
  const user = getUser()
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const res = await getHotels()
      // 如果是酒店管理员，只显示自己的酒店
      if (user?.userType === UserType.HOTEL_ADMIN) {
        setHotels(res.filter(hotel => hotel.userId === user.id))
      } else {
        setHotels(res)
      }
    } catch (error) {
      console.error('获取酒店列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个酒店吗？',
      onOk: async () => {
        try {
          await deleteHotel(id)
          message.success('删除成功')
          fetchHotels()
        } catch (error) {
          console.error('删除失败:', error)
        }
      },
    })
  }

  const columns: ColumnsType<Hotel> = [
    {
      title: '酒店名称',
      dataIndex: 'hotelNameZh',
      key: 'hotelNameZh',
      width: 200,
    },
    {
      title: '地址',
      dataIndex: 'hotelAddress',
      key: 'hotelAddress',
      ellipsis: true,
    },
    {
      title: '星级',
      dataIndex: 'hotelStars',
      key: 'hotelStars',
      width: 80,
      render: (stars: number) => stars ? `${stars}星` : '-',
    },
    {
      title: '电话',
      dataIndex: 'hotelTele',
      key: 'hotelTele',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'hotelStatus',
      key: 'hotelStatus',
      width: 150,
      render: (status: HotelStatus, record: Hotel) => (
        <Space direction="vertical" size={0}>
          <Tag color={statusMap[status]?.color}>{statusMap[status]?.text || '未知'}</Tag>
          {status === HotelStatus.REJECTED && record.hotelRemark?.includes('【拒绝原因】') && (
            <span style={{ fontSize: 12, color: '#ff4d4f' }}>
              {record.hotelRemark.replace('【拒绝原因】', '')}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/hotels/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="酒店列表"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/hotels/new')}>
          新增酒店
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </Card>
  )
}

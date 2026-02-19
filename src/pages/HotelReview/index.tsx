import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, message, Descriptions } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import { getHotels, updateHotel } from '@/api/hotel'
import { Hotel, HotelStatus } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const statusMap = {
  [HotelStatus.PENDING_APPROVAL]: { text: '待审核', color: 'processing' },
  [HotelStatus.APPROVED]: { text: '已通过', color: 'success' },
  [HotelStatus.REJECTED]: { text: '已拒绝', color: 'error' },
  [HotelStatus.DISABLED]: { text: '已禁用', color: 'warning' },
}

export default function HotelReview() {
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null)

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const res = await getHotels()
      setHotels(res)
    } catch (error) {
      console.error('获取酒店列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  const handleApprove = async (hotel: Hotel) => {
    Modal.confirm({
      title: '确认通过',
      content: `确定要通过酒店"${hotel.hotelNameZh}"的审核吗？`,
      onOk: async () => {
        try {
          await updateHotel(hotel.id, { hotelStatus: HotelStatus.APPROVED })
          message.success('审核通过')
          fetchHotels()
        } catch (error) {
          console.error('审核失败:', error)
        }
      },
    })
  }

  const handleReject = async (hotel: Hotel) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝酒店"${hotel.hotelNameZh}"的审核吗？`,
      onOk: async () => {
        try {
          await updateHotel(hotel.id, { hotelStatus: HotelStatus.REJECTED })
          message.success('已拒绝')
          fetchHotels()
        } catch (error) {
          console.error('操作失败:', error)
        }
      },
    })
  }

  const handleDisable = async (hotel: Hotel) => {
    Modal.confirm({
      title: '确认禁用',
      content: `确定要禁用酒店"${hotel.hotelNameZh}"吗？`,
      onOk: async () => {
        try {
          await updateHotel(hotel.id, { hotelStatus: HotelStatus.DISABLED })
          message.success('已禁用')
          fetchHotels()
        } catch (error) {
          console.error('操作失败:', error)
        }
      },
    })
  }

  const handleEnable = async (hotel: Hotel) => {
    Modal.confirm({
      title: '确认启用',
      content: `确定要启用酒店"${hotel.hotelNameZh}"吗？`,
      onOk: async () => {
        try {
          await updateHotel(hotel.id, { hotelStatus: HotelStatus.APPROVED })
          message.success('已启用')
          fetchHotels()
        } catch (error) {
          console.error('操作失败:', error)
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
      width: 100,
      render: (status: HotelStatus) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text || '未知'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentHotel(record)
              setDetailVisible(true)
            }}
          >
            查看
          </Button>
          {record.hotelStatus === HotelStatus.PENDING_APPROVAL && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
          {record.hotelStatus === HotelStatus.APPROVED && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleDisable(record)}
            >
              禁用
            </Button>
          )}
          {record.hotelStatus === HotelStatus.DISABLED && (
            <Button
              type="link"
              size="small"
              onClick={() => handleEnable(record)}
            >
              启用
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card title="酒店审核">
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

      <Modal
        title="酒店详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {currentHotel && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="酒店中文名称" span={2}>
              {currentHotel.hotelNameZh}
            </Descriptions.Item>
            <Descriptions.Item label="酒店英文名称" span={2}>
              {currentHotel.hotelNameEn || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="酒店地址" span={2}>
              {currentHotel.hotelAddress}
            </Descriptions.Item>
            <Descriptions.Item label="星级">
              {currentHotel.hotelStars ? `${currentHotel.hotelStars}星` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="电话">
              {currentHotel.hotelTele}
            </Descriptions.Item>
            <Descriptions.Item label="最早入住时间">
              {currentHotel.earliestCheckIn || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="最晚退房时间">
              {currentHotel.latestCheckOut || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="开业时间" span={2}>
              {currentHotel.hotelOpeningTime ? dayjs(currentHotel.hotelOpeningTime).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={2}>
              <Tag color={statusMap[currentHotel.hotelStatus!]?.color}>
                {statusMap[currentHotel.hotelStatus!]?.text || '未知'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="酒店描述" span={2}>
              {currentHotel.hotelDis || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {currentHotel.hotelRemark || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Button, Space, message, TimePicker } from 'antd'
import { SaveOutlined, SendOutlined } from '@ant-design/icons'
import { getHotelById, createHotel, updateHotel } from '@/api/hotel'
import { Hotel, HotelStatus } from '@/types'
import { getUser } from '@/utils/auth'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function HotelEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const user = getUser()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchHotel()
    }
  }, [id])

  const fetchHotel = async () => {
    if (!id) return
    try {
      const hotel = await getHotelById(Number(id))
      form.setFieldsValue({
        ...hotel,
        earliestCheckIn: hotel.earliestCheckIn ? dayjs(hotel.earliestCheckIn, 'HH:mm:ss') : null,
        latestCheckOut: hotel.latestCheckOut ? dayjs(hotel.latestCheckOut, 'HH:mm:ss') : null,
      })
    } catch (error) {
      console.error('获取酒店信息失败:', error)
    }
  }

  const handleSubmit = async (status: HotelStatus) => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const data: Partial<Hotel> = {
        ...values,
        hotelStatus: status,
        userId: user?.id,
        earliestCheckIn: values.earliestCheckIn ? values.earliestCheckIn.format('HH:mm:ss') : undefined,
        latestCheckOut: values.latestCheckOut ? values.latestCheckOut.format('HH:mm:ss') : undefined,
      }

      if (id) {
        await updateHotel(Number(id), data)
        message.success('保存成功')
      } else {
        await createHotel(data)
        message.success('创建成功')
      }
      navigate('/hotels')
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title={id ? '编辑酒店' : '新增酒店'}>
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 800 }}
      >
        <Form.Item
          label="酒店中文名称"
          name="hotelNameZh"
          rules={[{ required: true, message: '请输入酒店中文名称' }]}
        >
          <Input placeholder="请输入酒店中文名称" />
        </Form.Item>

        <Form.Item
          label="酒店英文名称"
          name="hotelNameEn"
        >
          <Input placeholder="请输入酒店英文名称" />
        </Form.Item>

        <Form.Item
          label="酒店地址"
          name="hotelAddress"
          rules={[{ required: true, message: '请输入酒店地址' }]}
        >
          <Input placeholder="请输入酒店地址" />
        </Form.Item>

        <Form.Item
          label="酒店星级"
          name="hotelStars"
        >
          <InputNumber
            min={1}
            max={5}
            style={{ width: '100%' }}
            placeholder="请输入酒店星级（1-5）"
          />
        </Form.Item>

        <Form.Item
          label="酒店电话"
          name="hotelTele"
          rules={[{ required: true, message: '请输入酒店电话' }]}
        >
          <Input placeholder="请输入酒店电话" />
        </Form.Item>

        <Form.Item
          label="最早入住时间"
          name="earliestCheckIn"
        >
          <TimePicker
            format="HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="请选择最早入住时间"
          />
        </Form.Item>

        <Form.Item
          label="最晚退房时间"
          name="latestCheckOut"
        >
          <TimePicker
            format="HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="请选择最晚退房时间"
          />
        </Form.Item>

        <Form.Item
          label="酒店描述"
          name="hotelDis"
        >
          <TextArea
            rows={4}
            placeholder="请输入酒店描述"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="备注"
          name="hotelRemark"
        >
          <TextArea
            rows={3}
            placeholder="请输入备注信息"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading}
              onClick={() => handleSubmit(HotelStatus.PENDING_APPROVAL)}
            >
              提交审核
            </Button>
            <Button onClick={() => navigate('/hotels')}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

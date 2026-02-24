import { View, Image, Text } from '@tarojs/components'
import React, { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { getHotelById } from '../../services/hotel'

type HotelDetailData = {
  id: number
  name: string
  address: string
  price: number
  rating: number
  cover: string
  tags: string[]
  highlights: string[]
  description: string
}

const DEFAULT_DETAIL: HotelDetailData = {
  id: 0,
  name: '酒店详情',
  address: '暂未获取酒店地址',
  price: 0,
  rating: 0,
  cover: 'https://images.pexels.com/photos/261156/pexels-photo-261156.jpeg?auto=compress&cs=tinysrgb&w=1200',
  tags: ['待接入数据库'],
  highlights: ['酒店信息将从数据库获取'],
  description: '当前展示为本地兜底信息，接口返回后会自动更新。'
}

export default function HotelDetail() {
  const params = Taro.getCurrentInstance().router?.params || {}
  const hotelId = Number(params.id)
  const [detail, setDetail] = useState<HotelDetailData>(DEFAULT_DETAIL)

  useEffect(() => {
    const loadDetail = async () => {
      if (!hotelId) return
      try {
        const data = await getHotelById(hotelId)
        const stars = Number(data.hotelStars || 0)
        setDetail({
          id: data.id,
          name: data.hotelNameZh || data.hotelNameEn || '未命名酒店',
          address: data.hotelAddress || '暂无地址信息',
          price: 0,
          rating: stars > 0 ? Math.min(5, Number((stars / 2).toFixed(1))) : 4.5,
          cover: DEFAULT_DETAIL.cover,
          tags: ['真实数据'],
          highlights: ['后端数据库酒店详情'],
          description: data.hotelDis || '暂无酒店介绍'
        })
      } catch (error) {
        Taro.showToast({ title: '详情加载失败', icon: 'none' })
      }
    }

    loadDetail()
  }, [hotelId])

  return (
    <View className="hotel-detail-page">
      <Image className="detail-hero" src={detail.cover} mode="aspectFill" />
      <View className="detail-body">
        <View className="detail-title-row">
          <View className="detail-title">{detail.name}</View>
          <View className="detail-rating">{detail.rating.toFixed(1)} 分</View>
        </View>
        <View className="detail-address">{detail.address}</View>
        <View className="detail-price">¥{detail.price} 起 / 晚</View>

        <View className="detail-tags">
          {detail.tags.map(tag => (
            <Text className="detail-tag" key={tag}>
              {tag}
            </Text>
          ))}
        </View>

        <View className="detail-section">
          <View className="detail-section-title">亮点服务</View>
          <View className="detail-list">
            {detail.highlights.map(item => (
              <View className="detail-list-item" key={item}>
                {item}
              </View>
            ))}
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-section-title">酒店介绍</View>
          <View className="detail-description">{detail.description}</View>
        </View>
      </View>
    </View>
  )
}

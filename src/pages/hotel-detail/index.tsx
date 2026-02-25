import { View, Image, Text, Button, Swiper, SwiperItem } from '@tarojs/components'
import React, { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { getHotelById, getAllRoomTypes, type HotelApiItem, type RoomTypeApiItem } from '../../services/hotel'
import hotelPlaceholder from '../../assets/icons/hotelExp.jpg'

type HotelDetailData = {
  id: number
  name: string
  address: string
  rating: number
  cover: string
  tags: string[]
  description: string
  phone: string
  stars: number
}

const DEFAULT_DETAIL: HotelDetailData = {
  id: 0,
  name: '酒店详情',
  address: '暂未获取酒店地址',
  rating: 0,
  cover: hotelPlaceholder,
  tags: ['待接入数据库'],
  description: '当前展示为本地兜底信息，接口返回后会自动更新。',
  phone: '暂无电话',
  stars: 0
}

const normalizeHotelDetail = (data: HotelApiItem): HotelDetailData => {
  const stars = Number(data.hotelStars || 0)
  return {
    id: data.id,
    name: data.hotelNameZh || data.hotelNameEn || '未命名酒店',
    address: data.hotelAddress || '暂无地址信息',
    rating: stars > 0 ? Math.min(5, Number((stars / 2).toFixed(1))) : 4.5,
    cover: hotelPlaceholder,
    tags: stars >= 7 ? ['豪华', '高星级'] : stars >= 5 ? ['舒适', '高品质'] : ['经济', '实惠'],
    description: data.hotelDis || '暂无酒店介绍',
    phone: data.hotelTele || '暂无电话',
    stars
  }
}

export default function HotelDetail() {
  const currentInstance = Taro.getCurrentInstance()
  const params = (currentInstance.router && currentInstance.router.params) || {}
  const hotelId = Number(params.id)
  const [detail, setDetail] = useState<HotelDetailData>(DEFAULT_DETAIL)
  const [roomTypes, setRoomTypes] = useState<RoomTypeApiItem[]>([])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([DEFAULT_DETAIL.cover])
  const [checkInDate, setCheckInDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [bookingGuests, setBookingGuests] = useState<string>('1间房，1成人，0儿童')

  useEffect(() => {
    const loadDetail = async () => {
      if (!hotelId) return
      setLoading(true)
      try {
        const [hotelData, allRoomTypes] = await Promise.all([
          getHotelById(hotelId),
          getAllRoomTypes()
        ])
        setDetail(normalizeHotelDetail(hotelData))
        setRoomTypes(allRoomTypes.filter(rt => rt.hotelId === hotelId))
        // 尝试从接口数据中解析图片数组（兼容多种字段名和格式）
        const rawImgs = (hotelData as any).images || (hotelData as any).photos || (hotelData as any).hotelImages || (hotelData as any).hotelPhotos || []
        let imgsArray: string[] = []
        if (Array.isArray(rawImgs)) {
          imgsArray = rawImgs.map((it: any) => typeof it === 'string' ? it : (it && (it.url || it.src || it.path) ? (it.url || it.src || it.path) : '')).filter(Boolean)
        } else if (typeof rawImgs === 'string' && rawImgs) {
          imgsArray = [rawImgs]
        }
        if (imgsArray.length === 0 && (hotelData as any).hotelImage) {
          const single = (hotelData as any).hotelImage
          if (typeof single === 'string') imgsArray = [single]
        }
        setImages(imgsArray.length > 0 ? imgsArray : [DEFAULT_DETAIL.cover])
      } catch (error) {
        Taro.showToast({ title: '详情加载失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [hotelId])

  const handleBookRoom = (roomType: RoomTypeApiItem) => {
    Taro.showToast({ title: `预订 ${roomType.roomTypeName}`, icon: 'none', duration: 1500 })
    // TODO: 跳转到预订页，传递 hotelId + roomTypeId
  }

  const handleCallHotel = () => {
    if (!detail.phone || detail.phone === '暂无电话') {
      Taro.showToast({ title: '暂无联系电话', icon: 'none' })
      return
    }
    Taro.makePhoneCall({ phoneNumber: detail.phone })
  }

  return (
    <View className="hotel-detail-page">
      <View className="detail-hero-wrap">
        <View className="detail-image-container">
          <View className="detail-image-inner">
            <Swiper className="detail-swiper" indicatorDots autoplay circular>
              {images.map((src, idx) => (
                <SwiperItem key={idx}>
                  <Image className="detail-hero" src={src} mode="aspectFill" />
                </SwiperItem>
              ))}
            </Swiper>
          </View>
        </View>
        {/* 图片顶部不再显示返回按钮，保留页面其它返回实现 */}
      </View>
      <View className="detail-body">
        <View className="detail-title-row">
          <View className="detail-title">{detail.name}</View>
          <View className="detail-rating">{detail.rating.toFixed(1)} 分</View>
        </View>
        <View className="detail-address">{detail.address}</View>
        <View className="detail-stars">
          {detail.stars > 0 ? `${detail.stars} 星级酒店` : '暂无星级'}
        </View>

        <View className="detail-tags">
          {detail.tags.map(tag => (
            <Text className="detail-tag" key={tag}>
              {tag}
            </Text>
          ))}
        </View>

        <View className="date-guest-banner" onClick={() => {
          const url = `/pages/date-select/index?checkIn=${encodeURIComponent(checkInDate)}&checkOut=${encodeURIComponent(checkOutDate)}`
          Taro.navigateTo({ url, events: {
            dateSelected: (data: any) => {
              if (data && data.checkIn) setCheckInDate(data.checkIn)
              if (data && data.checkOut) setCheckOutDate(data.checkOut)
            }
          } })
        }}>
          <View className="date-block">
            <Text className="date-line">{checkInDate} — {checkOutDate}</Text>
            <Text className="nights">共{Math.max(1, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime())/(24*60*60*1000)))}晚</Text>
          </View>
          <View className="guest-block">
            <Text className="guest-text">{bookingGuests}</Text>
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-section-title">酒店介绍</View>
          <View className="detail-description">{detail.description}</View>
        </View>

        <View className="detail-section">
          <View className="detail-section-title">联系方式</View>
          <View className="detail-phone" onClick={handleCallHotel}>
            <Text className="phone-label">电话：</Text>
            <Text className="phone-number">{detail.phone}</Text>
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-section-title">房型列表</View>
          {loading && <View className="room-loading">房型加载中...</View>}
          {!loading && roomTypes.length === 0 && <View className="room-empty">暂无房型信息</View>}
          {roomTypes.map(rt => {
            const price = Number(rt.roomTypePrice || 0)
            const restCount = Number(rt.roomTypeRest || 0)
            return (
              <View className="room-type-card" key={rt.id}>
                <View className="room-type-info">
                  <View className="room-type-name">{rt.roomTypeName}</View>
                  <View className="room-type-desc">{rt.roomTypeDis || '暂无描述'}</View>
                  <View className="room-type-rest">剩余 {restCount} 间</View>
                </View>
                <View className="room-type-price-area">
                  <View className="room-type-price">¥{price}</View>
                  <Button className="room-type-book-btn" size="mini" type="primary" onClick={() => handleBookRoom(rt)}>
                    预订
                  </Button>
                </View>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

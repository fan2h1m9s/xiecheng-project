import { View, Text, Image, Picker } from '@tarojs/components'
import React, { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import hotelPlaceholder from '../../assets/icons/hotelExp.jpg'
const { AMapWX } = require('../../utils/amap-wx')

const mockHotels = [
  {
    id: 1,
    name: '豪华酒店A',
    rating: 4.8,
    favorites: 2341,
    reviews: 1203,
    location: '上海 · 静安寺',
    tags: ['方便停车', '机器人服务', '靠近地铁站'],
    price: 399,
    distanceKm: 1.8,
    image: hotelPlaceholder
  },
  {
    id: 2,
    name: '舒适酒店B',
    rating: 4.5,
    favorites: 985,
    reviews: 642,
    location: '北京 · 国贸',
    tags: ['早餐丰富', '健身房', '亲子友好'],
    price: 299,
    distanceKm: 3.2,
    image: hotelPlaceholder
  },
  {
    id: 3,
    name: '经济酒店C',
    rating: 4.2,
    favorites: 412,
    reviews: 218,
    location: '广州 · 天河',
    tags: ['靠近地铁站', '自助入住', '安静舒适'],
    price: 199,
    distanceKm: 0.9,
    image: hotelPlaceholder
  }
]

export default function HotelList() {
  const [showFilter, setShowFilter] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [showGuestPanel, setShowGuestPanel] = useState(false)
  const [activeFilter, setActiveFilter] = useState('distance')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [currentLocation, setCurrentLocation] = useState('定位中')
  const [bookingCity, setBookingCity] = useState('深圳')
  const [checkInDate, setCheckInDate] = useState('2026-02-11')
  const [checkOutDate, setCheckOutDate] = useState('2026-02-12')
  const [bookingGuests, setBookingGuests] = useState('1间房，1成人，1儿童')
  const [guestDraft, setGuestDraft] = useState({ rooms: 1, adults: 1, children: 1 })

  const AMAP_KEY = 'f797b890e4324fcb4f7d7e2dab927978'

  useEffect(() => {
    const amap = new AMapWX({ key: AMAP_KEY })
    amap.getRegeo({
      success: (res: any) => {
        const first = Array.isArray(res) ? res[0] : res
        const address = first && first.addressComponent ? first.addressComponent : null
        const city = address && address.city ? address.city : (address && address.province ? address.province : '')
        const name = first && first.name ? first.name : ''
        const display = [city, name].filter(Boolean).join(' · ')
        setCurrentLocation(display || '已定位')
      },
      fail: () => {
        setCurrentLocation('定位失败')
      }
    })
  }, [])

  useEffect(() => {
    if (!bookingCity) return
    Taro.setNavigationBarTitle({ title: bookingCity })
  }, [bookingCity])

  // 筛选选项数据
  const filterSections = [
    { caption: '酒店位置', value: currentLocation, needIcon: false, type: 'location' },
    { caption: '行政区域', value: '南山区', needIcon: true, type: 'district' },
    { caption: '商圈', value: 'xx商圈', needIcon: true, type: 'business' },
    { caption: '地铁', value: '深大地铁站', needIcon: true, type: 'subway' }
  ]

  const sortOptions = [
    { key: 'price', label: '价格' },
    { key: 'distance', label: '距离' },
    { key: 'rating', label: '评分' }
  ]

  const cityOptions = ['深圳', '北京', '上海', '广州', '杭州', '成都']
  const formatShortDate = (value: string) => {
    if (!value) return ''
    return value.length >= 10 ? value.slice(5) : value
  }

  const parseGuestNumbers = (value: string) => {
    const roomsMatch = value.match(/(\d+)间房/)
    const adultsMatch = value.match(/(\d+)成人/)
    const childrenMatch = value.match(/(\d+)儿童/)
    return {
      rooms: roomsMatch ? Number(roomsMatch[1]) : 1,
      adults: adultsMatch ? Number(adultsMatch[1]) : 1,
      children: childrenMatch ? Number(childrenMatch[1]) : 0
    }
  }

  const buildGuestLabel = (rooms: number, adults: number, children: number) => {
    return `${rooms}间房，${adults}成人，${children}儿童`
  }

  const openGuestPanel = () => {
    setGuestDraft(parseGuestNumbers(bookingGuests))
    setShowGuestPanel(true)
  }

  const applyGuestDraft = () => {
    setBookingGuests(buildGuestLabel(guestDraft.rooms, guestDraft.adults, guestDraft.children))
    setShowGuestPanel(false)
  }

  const calcNights = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
    return Math.max(0, diffDays)
  }

  const openDateSelect = () => {
    const url = `/pages/date-select/index?checkIn=${encodeURIComponent(checkInDate)}&checkOut=${encodeURIComponent(checkOutDate)}`
    Taro.navigateTo({
      url,
      events: {
        dateSelected: data => {
          if (data?.checkIn) setCheckInDate(data.checkIn)
          if (data?.checkOut) setCheckOutDate(data.checkOut)
        }
      }
    })
  }

  const openCitySelect = () => {
    const url = `/pages/city-select/index?city=${encodeURIComponent(bookingCity)}`
    Taro.navigateTo({
      url,
      events: {
        citySelected: data => {
          if (data?.city) {
            setBookingCity(data.city)
            setCurrentLocation(data.city)
          }
        }
      }
    })
  }

  const SettingItem = ({ caption, value, needIcon, type }: {
    caption: string; value: string; needIcon: boolean; type: string;
  }) => {
    const isSelected = selectedFilters[type] !== undefined
    return (
      <View
        className={`settingItem ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          setSelectedFilters(prev => ({
            ...prev,
            [type]: value || '已选择'
          }))
        }}
      >
        <Text className='caption'>{caption}</Text>
        <Text className='value'>{value}</Text>
        {needIcon && <View className='icon' />}
      </View>
    )
  }

  const sortedHotels = useMemo(() => {
    const sorted = [...mockHotels]
    sorted.sort((a, b) => {
      if (activeFilter === 'price') return a.price - b.price
      if (activeFilter === 'distance') return a.distanceKm - b.distanceKm
      if (activeFilter === 'rating') return b.rating - a.rating
      return 0
    })
    return sorted
  }, [activeFilter])

  return (
    <View className="hotel-list-page">
      {/* 头部区域 */}
      <View className="hotel-list-header">
        <View className="searchRow">
          <View className="searchLeft">
            <View className="infoCard" onClick={() => setShowInfoPanel(prev => !prev)}>
              <View className="infoLine">
                <Text className="infoLabel">我的位置</Text>
              </View>
              <View className="infoLine">
                <Text className="infoLabel">入住</Text>
                <Text className="infoValue">{formatShortDate(checkInDate)}</Text>
              </View>
              <View className="infoLine">
                <Text className="infoLabel">退房</Text>
                <Text className="infoValue">{formatShortDate(checkOutDate)}</Text>
              </View>
              <View className="infoLine">
                <Text className="infoLabel">需求</Text>
                <Text className="infoValue">{bookingGuests}</Text>
              </View>
            </View>
            <View
              className="searchCard"
              onClick={() => {
                Taro.showToast({ title: '搜索功能待接入', icon: 'none' })
              }}
            >
              <Text className="searchPlaceholder">位置/品牌/酒店</Text>
            </View>
          </View>
          <View
            className="mapButton"
            onClick={() => Taro.navigateTo({ url: '/pages/hotel-map/index' })}
          >
            <Text className="mapIcon">地图</Text>
          </View>
        </View>
        {showInfoPanel && (
          <View className="infoPanelRow">
            <View className="infoCardPanel">
              <View className="info-panel-line">
                <View onClick={openCitySelect}>
                  <Text>具体位置：{currentLocation}</Text>
                </View>
              </View>
              <View className="info-panel-line">
                <View onClick={openDateSelect}>
                  <Text>{formatShortDate(checkInDate)}日-{formatShortDate(checkOutDate)}日 共{calcNights(checkInDate, checkOutDate)}晚</Text>
                </View>
              </View>
              <View className="info-panel-line">
                <View onClick={openGuestPanel}>
                  <Text>{bookingGuests.replace(/[，,\s]/g, '')}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {showGuestPanel && (
          <View className="guest-overlay">
            <View className="guest-backdrop" onClick={() => setShowGuestPanel(false)} />
            <View className="guest-panel">
              <View className="guest-row">
                <Text className="guest-label">房间</Text>
                <View className="guest-stepper">
                  <View
                    className={`stepper-btn ${guestDraft.rooms <= 1 ? 'disabled' : ''}`}
                    onClick={() => {
                      if (guestDraft.rooms <= 1) return
                      setGuestDraft(prev => ({ ...prev, rooms: prev.rooms - 1 }))
                    }}
                  >
                    -
                  </View>
                  <Text className="stepper-value">{guestDraft.rooms}</Text>
                  <View
                    className="stepper-btn"
                    onClick={() => setGuestDraft(prev => ({ ...prev, rooms: prev.rooms + 1 }))}
                  >
                    +
                  </View>
                </View>
              </View>
              <View className="guest-row">
                <Text className="guest-label">成人</Text>
                <View className="guest-stepper">
                  <View
                    className={`stepper-btn ${guestDraft.adults <= 1 ? 'disabled' : ''}`}
                    onClick={() => {
                      if (guestDraft.adults <= 1) return
                      setGuestDraft(prev => ({ ...prev, adults: prev.adults - 1 }))
                    }}
                  >
                    -
                  </View>
                  <Text className="stepper-value">{guestDraft.adults}</Text>
                  <View
                    className="stepper-btn"
                    onClick={() => setGuestDraft(prev => ({ ...prev, adults: prev.adults + 1 }))}
                  >
                    +
                  </View>
                </View>
              </View>
              <View className="guest-row">
                <Text className="guest-label">儿童</Text>
                <View className="guest-stepper">
                  <View
                    className={`stepper-btn ${guestDraft.children <= 0 ? 'disabled' : ''}`}
                    onClick={() => {
                      if (guestDraft.children <= 0) return
                      setGuestDraft(prev => ({ ...prev, children: prev.children - 1 }))
                    }}
                  >
                    -
                  </View>
                  <Text className="stepper-value">{guestDraft.children}</Text>
                  <View
                    className="stepper-btn"
                    onClick={() => setGuestDraft(prev => ({ ...prev, children: prev.children + 1 }))}
                  >
                    +
                  </View>
                </View>
              </View>
              <View className="guest-actions">
                <View className="guest-cancel" onClick={() => setShowGuestPanel(false)}>
                  取消
                </View>
                <View className="guest-confirm" onClick={applyGuestDraft}>
                  确定
                </View>
              </View>
            </View>
          </View>
        )}
        <View className="headerRow">
          {sortOptions.map(option => (
            <View
              key={option.key}
              className={`sortButton ${activeFilter === option.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(option.key)}
            >
              <Text className="sortLabel">{option.label}</Text>
            </View>
          ))}
          <View
            className="sortButton filterButton"
            onClick={() => setShowFilter(!showFilter)}
          >
            <Text className="sortLabel">筛选</Text>
          </View>
        </View>
      </View>


      {/* 筛选面板 */}
      {showFilter && (
        <View className="filter-overlay">
          <View className="filter-backdrop" onClick={() => setShowFilter(false)} />
          <View className="filter-panel">
            <View className="filterContent">
              {filterSections.map((item, index) => (
                <SettingItem 
                  key={index}
                  caption={item.caption}
                  value={item.value}
                  needIcon={item.needIcon}
                  type={item.type}
                />
              ))}
            </View>
            <View className="filterMenu">
              <Text className="clear" onClick={() => { setSelectedFilters({}); setShowFilter(false) }}>
                清除筛选
              </Text>
              <Text className="confirm" onClick={() => setShowFilter(false)}>
                确定
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 酒店列表 */}
      <View className="hotel-list-content">
        {sortedHotels.map(hotel => (
          <View 
            key={hotel.id} 
            className="hotel-item"
            onClick={() => Taro.navigateTo({ url: `/pages/hotel-detail/index?id=${hotel.id}` })}
          >
            <Image className="hotel-thumb" src={hotel.image} mode="aspectFill" />
            <View className="hotel-info">
              <Text className="hotel-name">{hotel.name}</Text>
              <View className="hotel-meta">
                <Text className="hotel-rating">{hotel.rating}分</Text>
                <Text className="hotel-divider">|</Text>
                <Text className="hotel-favorites">收藏 {hotel.favorites}</Text>
                <Text className="hotel-divider">|</Text>
                <Text className="hotel-reviews">点评 {hotel.reviews}</Text>
              </View>
              <Text className="hotel-location">{hotel.location}</Text>
              <View className="hotel-tags">
                {hotel.tags.map(tag => (
                  <Text key={tag} className="hotel-tag">{tag}</Text>
                ))}
              </View>
            </View>
            <View className="hotel-price">
              <Text className="price-number">¥{hotel.price}</Text>
              <Text className="price-desc">起/晚</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
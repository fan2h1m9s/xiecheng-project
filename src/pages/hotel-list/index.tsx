import { View, Text, Image } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import hotelPlaceholder from '../../assets/icons/hotelExp.jpg'
import searchIcon from '../../assets/icons/OIP.jpg'
import mapIcon from '../../assets/icons/map.jpg'
import { getHotels, getAllRoomTypes, type HotelApiItem } from '../../services/hotel'
const { AMapWX } = require('../../utils/amap-wx')

const DEBUG_HOTEL_FLOW = typeof process !== 'undefined' && process.env
  ? process.env.NODE_ENV !== 'production'
  : true

const debugLog = (...args: any[]) => {
  if (!DEBUG_HOTEL_FLOW) return
  console.log('[HotelFlow][HotelList]', ...args)
}

type HotelListItem = {
  id: number
  name: string
  rating: number
  favorites: number
  reviews: number
  location: string
  tags: string[]
  price: number
  distanceKm: number
  image: string
}

const normalizeHotel = (hotel: HotelApiItem): HotelListItem => {
  const stars = Number(hotel.hotelStars || 0)
  return {
    id: hotel.id,
    name: hotel.hotelNameZh || hotel.hotelNameEn || '未命名酒店',
    rating: stars > 0 ? Math.min(5, Number((stars / 2).toFixed(1))) : 4.5,
    favorites: 0,
    reviews: 0,
    location: hotel.hotelAddress || '暂无地址信息',
    tags: ['真实数据'],
    price: 0,
    distanceKm: 0,
    image: hotelPlaceholder
  }
}

export default function HotelList() {
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [showGuestPanel, setShowGuestPanel] = useState(false)
  const [activeFilter, setActiveFilter] = useState('distance')
  const [currentLocation, setCurrentLocation] = useState('定位中')
  const [bookingCity, setBookingCity] = useState('深圳')
  const [checkInDate, setCheckInDate] = useState('2026-02-11')
  const [checkOutDate, setCheckOutDate] = useState('2026-02-12')
  const [bookingGuests, setBookingGuests] = useState('1间房，1成人，0儿童')
  const [guestDraft, setGuestDraft] = useState({ rooms: 1, adults: 1, children: 1 })
  const [hotels, setHotels] = useState<HotelListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [locationSuffix, setLocationSuffix] = useState('')

  const AMAP_KEY = 'f797b890e4324fcb4f7d7e2dab927978'

  const safeDecode = (value?: string) => {
    if (!value) return ''
    try {
      return decodeURIComponent(value)
    } catch (error) {
      return value
    }
  }

  const fetchCurrentLocation = () => {
    debugLog('fetchCurrentLocation start')
    const amap = new AMapWX({ key: AMAP_KEY })
    amap.getRegeo({
      success: (res: any) => {
        debugLog('fetchCurrentLocation success', res)
        const first = Array.isArray(res) ? res[0] : res
        const regeoData = first && first.regeocodeData ? first.regeocodeData : null
        const address = first && first.addressComponent
          ? first.addressComponent
          : (regeoData && regeoData.addressComponent ? regeoData.addressComponent : null)
        const cityRaw = address && address.city ? address.city : ''
        const city = Array.isArray(cityRaw)
          ? (cityRaw[0] || '')
          : (cityRaw || (address && address.province ? address.province : ''))
        const district = address && address.district ? address.district : ''
        const township = address && address.township ? address.township : ''
        const name = first && first.name ? first.name : ''
        const display = [city, district, township, name].filter(Boolean).join(' · ')

        if (city) {
          setBookingCity(city)
        }
        setCurrentLocation(display || city || '已定位')
        setLocationSuffix('')
        setSearchKeyword('')
      },
      fail: (err: any) => {
        debugLog('fetchCurrentLocation fail', err)
        setCurrentLocation('定位失败')
      }
    })
  }

  useEffect(() => {
    const currentInstance = Taro.getCurrentInstance()
    const params = (currentInstance.router && currentInstance.router.params) || {}
    debugLog('router params on mount', params)
    const cityParam = safeDecode(params.city)
    const keywordParam = safeDecode(params.keyword)
    const checkInParam = safeDecode(params.checkIn)
    const checkOutParam = safeDecode(params.checkOut)
    if (cityParam) {
      setBookingCity(cityParam)
      setCurrentLocation(cityParam)
    }
    if (keywordParam) {
      setSearchKeyword(keywordParam)
      setLocationSuffix(keywordParam)
    }
    if (checkInParam) setCheckInDate(checkInParam)
    if (checkOutParam) setCheckOutDate(checkOutParam)
  }, [])

  useEffect(() => {
    const currentInstance = Taro.getCurrentInstance()
    const params = (currentInstance.router && currentInstance.router.params) || {}
    const cityParam = safeDecode(params.city)
    if (cityParam) {
      debugLog('skip geolocation because city passed from previous page', cityParam)
      return
    }
    fetchCurrentLocation()
  }, [])

  useEffect(() => {
    if (!bookingCity) return
    Taro.setNavigationBarTitle({ title: bookingCity })
  }, [bookingCity])

  useEffect(() => {
    const loadHotels = async () => {
      setLoading(true)
      debugLog('loadHotels start', { bookingCity, checkInDate, checkOutDate })
      try {
        const [hotelsData, roomTypesData] = await Promise.all([
          getHotels(),
          getAllRoomTypes()
        ])
        debugLog('loadHotels success', { count: Array.isArray(hotelsData) ? hotelsData.length : 0 })
        
        // 计算每个酒店的最低房价
        const hotelsWithPrice = hotelsData.map(hotel => {
          const normalizedHotel = normalizeHotel(hotel)
          const hotelRoomTypes = roomTypesData.filter(rt => rt.hotelId === hotel.id)
          if (hotelRoomTypes.length > 0) {
            const prices = hotelRoomTypes.map(rt => Number(rt.roomTypePrice || 0))
            normalizedHotel.price = Math.min(...prices)
          }
          return normalizedHotel
        })
        
        setHotels(hotelsWithPrice)
      } catch (error) {
        debugLog('loadHotels fail', error)
        const message = error instanceof Error ? error.message : '酒店数据加载失败'
        Taro.showToast({ title: message.slice(0, 18), icon: 'none' })
      } finally {
        setLoading(false)
        debugLog('loadHotels end')
      }
    }

    loadHotels()
  }, [])

  // 筛选选项数据
  const currentLocationText = locationSuffix ? `${currentLocation} ${locationSuffix}` : currentLocation

  const sortOptions = [
    { key: 'price', label: '价格' },
    { key: 'distance', label: '距离' },
    { key: 'rating', label: '评分' }
  ]

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

  const guestNumbers = useMemo(() => parseGuestNumbers(bookingGuests), [bookingGuests])
  const guestTotal = guestNumbers.adults + guestNumbers.children

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
    if (diffDays === 0) return 1
    return Math.max(0, diffDays)
  }

  const openDateSelect = () => {
    const url = `/pages/date-select/index?checkIn=${encodeURIComponent(checkInDate)}&checkOut=${encodeURIComponent(checkOutDate)}`
    Taro.navigateTo({
      url,
      events: {
        dateSelected: data => {
          if (data && data.checkIn) setCheckInDate(data.checkIn)
          if (data && data.checkOut) setCheckOutDate(data.checkOut)
        }
      }
    })
  }

  const openCitySelect = () => {
    const url = `/pages/search/index?city=${encodeURIComponent(bookingCity)}&tab=domestic&scene=city`
    Taro.navigateTo({
      url,
      events: {
        keywordSelected: data => {
          if (!data || data.keyword === undefined) return
          if (data.isCity) {
            setBookingCity(data.keyword)
            setCurrentLocation(data.keyword)
            setLocationSuffix('')
            setSearchKeyword('')
          }
        }
      }
    })
  }

  const openSearchPage = () => {
    const url = `/pages/search/index?keyword=${encodeURIComponent(searchKeyword)}&city=${encodeURIComponent(bookingCity)}`
    Taro.navigateTo({
      url,
      events: {
        keywordSelected: data => {
          if (data && data.keyword !== undefined) {
            if (data.isCity) {
              setBookingCity(data.keyword)
              setCurrentLocation(data.keyword)
              setLocationSuffix('')
              setSearchKeyword('')
            } else {
              setSearchKeyword(data.keyword)
              setLocationSuffix(data.keyword)
            }
          }
        }
      }
    })
  }

  const sortedHotels = useMemo(() => {
    const sorted = [...hotels]
    sorted.sort((a, b) => {
      if (activeFilter === 'price') return a.price - b.price
      if (activeFilter === 'distance') return a.distanceKm - b.distanceKm
      if (activeFilter === 'rating') return b.rating - a.rating
      return 0
    })
    return sorted
  }, [activeFilter, hotels])

  return (
    <View className="hotel-list-page">
      {/* 头部区域 */}
      <View className="hotel-list-header">
        <View className="searchRow">
          <View className="searchLeft">
            <View className="infoCard" onClick={() => setShowInfoPanel(prev => !prev)}>
              <View className="infoLine infoLineTop">
                <Text className="infoLabel">我的</Text>
                <View className="infoGroup">
                  <Text className="infoDate">{formatShortDate(checkInDate)}</Text>
                  <Text className="infoMeta">{guestNumbers.rooms}间</Text>
                </View>
              </View>
              <View className="infoLine infoLineBottom">
                <Text className="infoLabel">位置</Text>
                <View className="infoGroup">
                  <Text className="infoDate">{formatShortDate(checkOutDate)}</Text>
                  <Text className="infoMeta">{guestTotal}人</Text>
                </View>
              </View>
            </View>
            <View
              className="searchCard"
              onClick={openSearchPage}
            >
              <Image className="searchIcon" src={searchIcon} mode="aspectFit" />
              <View className="searchInput">
                <Text className="searchPlaceholder">{searchKeyword || '位置/品牌/酒店'}</Text>
              </View>
            </View>
          </View>
          <View
            className="mapButton"
            onClick={() => Taro.navigateTo({ url: '/pages/hotel-map/index' })}
          >
            <Image className="mapIcon" src={mapIcon} mode="aspectFit" />
          </View>
        </View>
        {showInfoPanel && (
          <View className="infoPanelRow">
            <View className="infoCardPanel">
              <View className="info-panel-line">
                <View onClick={openCitySelect}>
                  <Text>当前位置：{currentLocationText}</Text>
                </View>
                <View
                  className="location-btn"
                  onClick={fetchCurrentLocation}
                >
                  <Text className="location-emoji">📍</Text>
                </View>
              </View>
              <View className="info-panel-line">
                <View className="date-line" onClick={openDateSelect}>
                  <Text className="date-range">{formatShortDate(checkInDate)}日 - {formatShortDate(checkOutDate)}日</Text>
                  <Text className="night-count">共{calcNights(checkInDate, checkOutDate)}晚</Text>
                </View>
              </View>
              <View className="info-panel-line">
                <View onClick={openGuestPanel}>
                  <View className="guest-summary">
                    <Text className="guest-item">{guestNumbers.rooms}间房</Text>
                    <Text className="guest-item">{guestNumbers.adults}成人</Text>
                    <Text className="guest-item">{guestNumbers.children}儿童</Text>
                  </View>
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
        </View>
      </View>

      {/* 酒店列表 */}
      <View className="hotel-list-content">
        {loading && <View className="hotel-item">酒店加载中...</View>}
        {!loading && sortedHotels.length === 0 && <View className="hotel-item">暂无酒店数据</View>}
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
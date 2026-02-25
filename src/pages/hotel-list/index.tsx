import { View, Text, Image, Input } from '@tarojs/components'
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
  const [showFilterPanel, setShowFilterPanel] = useState(false)
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
  // 详细筛选状态
  const FILTER_TAGS = ['含早餐', '近地铁', '亲子', '商务出行', '高评分']
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState<number | ''>('')
  const [priceMax, setPriceMax] = useState<number | ''>('')
  // 更多筛选选项
  const DISTANCE_OPTIONS = [
    { label: '<2km', value: 2 },
    { label: '<5km', value: 5 },
    { label: '<10km', value: 10 },
    // 已移除小于50km选项，保留较常用的近距离筛选
  ]
  const ACCOMMODATION_TYPES = ['酒店', '民宿', '公寓', '青年旅舍']
  const HOTEL_FEATURES = ['含早餐', '近地铁', '温泉', '无烟房', '亲子']
  const HOT_FILTERS = ['高评分', '限时优惠', '自助早餐']
  const ROOM_FEATURES = ['大床', '双床', '可加床', '带浴缸']
  const BRANDS = ['希尔顿', '万豪', '如家', '锦江']

  const [selectedDistance, setSelectedDistance] = useState<number | null>(null)
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([])
  const [selectedHotelFeatures, setSelectedHotelFeatures] = useState<string[]>([])
  const [selectedHotFilters, setSelectedHotFilters] = useState<string[]>([])
  const [selectedRoomFeatures, setSelectedRoomFeatures] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

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

  const filteredHotels = useMemo(() => {
    return hotels.filter(h => {
      // tag filter
      if (filterTags.length > 0) {
        const hasTag = filterTags.some(t => (h.tags || []).includes(t))
        if (!hasTag) return false
      }
      // price filter
      if (priceMin !== '' && h.price < Number(priceMin)) return false
      if (priceMax !== '' && h.price > Number(priceMax)) return false
      // keyword filter
      if (searchKeyword && !h.name.includes(searchKeyword) && !h.location.includes(searchKeyword)) return false
      // distance filter
      if (selectedDistance !== null && typeof h.distanceKm === 'number') {
        if (h.distanceKm > selectedDistance) return false
      }
      // accommodation types (OR within group)
      if (selectedAccommodations.length > 0) {
        const ok = selectedAccommodations.some(t => (h.tags || []).includes(t))
        if (!ok) return false
      }
      // hotel features
      if (selectedHotelFeatures.length > 0) {
        const ok = selectedHotelFeatures.some(t => (h.tags || []).includes(t))
        if (!ok) return false
      }
      // hot filters
      if (selectedHotFilters.length > 0) {
        const ok = selectedHotFilters.some(t => (h.tags || []).includes(t))
        if (!ok) return false
      }
      // room features
      if (selectedRoomFeatures.length > 0) {
        const ok = selectedRoomFeatures.some(t => (h.tags || []).includes(t))
        if (!ok) return false
      }
      // brands
      if (selectedBrands.length > 0) {
        const ok = selectedBrands.some(t => (h.tags || []).includes(t))
        if (!ok) return false
      }
      return true
    })
  }, [hotels, filterTags, priceMin, priceMax, searchKeyword])

  const sortedHotels = useMemo(() => {
    const sorted = [...filteredHotels]
    sorted.sort((a, b) => {
      if (activeFilter === 'price') return a.price - b.price
      if (activeFilter === 'distance') return a.distanceKm - b.distanceKm
      if (activeFilter === 'rating') return b.rating - a.rating
      return 0
    })
    return sorted
  }, [activeFilter, filteredHotels])

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
        {/* 详细筛选面板 */}
        {showFilterPanel && (
          <View className="filter-overlay">
            <View className="filter-panel">
              <View className="filter-header">
                <Text className="filter-title">详细筛选</Text>
                <Text className="filter-close" onClick={() => setShowFilterPanel(false)}>关闭</Text>
              </View>
              <View className="filter-body">
                <View className="filter-section">
                  <Text className="section-label">价格区间(元)</Text>
                  <View className="price-row">
                    <Input className="price-input" type="number" value={priceMin === '' ? '' : String(priceMin)} onInput={e => setPriceMin(e.detail.value ? Number(e.detail.value) : '')} />
                    <Text className="price-sep">-</Text>
                    <Input className="price-input" type="number" value={priceMax === '' ? '' : String(priceMax)} onInput={e => setPriceMax(e.detail.value ? Number(e.detail.value) : '')} />
                  </View>
                </View>
                <View className="filter-section">
                  <Text className="section-label">标签</Text>
                  <View className="tag-options">
                    {FILTER_TAGS.map(tag => (
                      <View key={tag} className={`tag-opt ${filterTags.includes(tag) ? 'active' : ''}`} onClick={() => {
                        setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
                      }}>
                        <Text>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View className="filter-section">
                  <Text className="section-label">距离</Text>
                  <View className="tag-options">
                    {DISTANCE_OPTIONS.map(opt => (
                      <View key={opt.label} className={`tag-opt ${selectedDistance === opt.value ? 'active' : ''}`} onClick={() => setSelectedDistance(prev => prev === opt.value ? null : opt.value)}>
                        <Text>{opt.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="filter-section">
                  <Text className="section-label">住宿类型</Text>
                  <View className="tag-options">
                    {ACCOMMODATION_TYPES.map(t => (
                      <View key={t} className={`tag-opt ${selectedAccommodations.includes(t) ? 'active' : ''}`} onClick={() => setSelectedAccommodations(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
                        <Text>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="filter-section">
                  <Text className="section-label">酒店特色</Text>
                  <View className="tag-options">
                    {HOTEL_FEATURES.map(t => (
                      <View key={t} className={`tag-opt ${selectedHotelFeatures.includes(t) ? 'active' : ''}`} onClick={() => setSelectedHotelFeatures(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
                        <Text>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="filter-section">
                  <Text className="section-label">热门筛选</Text>
                  <View className="tag-options">
                    {HOT_FILTERS.map(t => (
                      <View key={t} className={`tag-opt ${selectedHotFilters.includes(t) ? 'active' : ''}`} onClick={() => setSelectedHotFilters(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
                        <Text>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="filter-section">
                  <Text className="section-label">客房特色</Text>
                  <View className="tag-options">
                    {ROOM_FEATURES.map(t => (
                      <View key={t} className={`tag-opt ${selectedRoomFeatures.includes(t) ? 'active' : ''}`} onClick={() => setSelectedRoomFeatures(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
                        <Text>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="filter-section">
                  <Text className="section-label">热门品牌</Text>
                  <View className="tag-options">
                    {BRANDS.map(t => (
                      <View key={t} className={`tag-opt ${selectedBrands.includes(t) ? 'active' : ''}`} onClick={() => setSelectedBrands(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
                        <Text>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <View className="filter-footer">
                <View className="filter-reset" onClick={() => { setFilterTags([]); setPriceMin(''); setPriceMax(''); setSelectedDistance(null); setSelectedAccommodations([]); setSelectedHotelFeatures([]); setSelectedHotFilters([]); setSelectedRoomFeatures([]); setSelectedBrands([]); }}>重置</View>
                <View className="filter-apply" onClick={() => setShowFilterPanel(false)}>应用筛选</View>
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
          <View className={`sortButton filterButton ${false ? 'active' : ''}`} onClick={() => setShowFilterPanel(true)}>
            <Text className="sortLabel">筛选</Text>
          </View>
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
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import './index.scss'
import bannerImage from '../../assets/icons/hotelExp.jpg'
import { AMAP_KEY } from '../../config/map-keys'

const { AMapWX } = require('../../utils/amap-wx')

const DEBUG_HOTEL_FLOW = typeof process !== 'undefined' && process.env
  ? process.env.NODE_ENV !== 'production'
  : true

const debugLog = (...args: any[]) => {
  if (!DEBUG_HOTEL_FLOW) return
  console.log('[HotelFlow][Index]', ...args)
}

const BANNER_HOTEL_ID = 1
const QUICK_TAGS = ['亲子', '豪华', '免费停车场', '含早餐', '近地铁', '高评分', '商务出行']

export default function Index() {
  const hasAutoLocatedRef = useRef(false)
  const [currentCity, setCurrentCity] = useState('定位中')
  const [currentLat, setCurrentLat] = useState<number | null>(null)
  const [currentLng, setCurrentLng] = useState<number | null>(null)
  const [keyword, setKeyword] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [checkInDateStr, setCheckInDateStr] = useState('')
  const [checkOutDateStr, setCheckOutDateStr] = useState('')
  const [nightCount, setNightCount] = useState(1)
  // 删除tab，仅保留国内
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [locationSuffix, setLocationSuffix] = useState('')
  const [locationAddress, setLocationAddress] = useState('正在获取定位地址...')

  const normalizeCityName = (cityRaw: any, provinceRaw: any) => {
    const cityFromRaw = Array.isArray(cityRaw)
      ? (cityRaw[0] || '')
      : (typeof cityRaw === 'string' ? cityRaw : '')
    const provinceFromRaw = typeof provinceRaw === 'string' ? provinceRaw : ''
    const cityName = cityFromRaw || provinceFromRaw
    return cityName || ''
  }

  // 初始化日期
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayStr = formatDate(today)
    const tomorrowStr = formatDate(tomorrow)

    setCheckInDate(todayStr)
    setCheckOutDate(tomorrowStr)
    setCheckInDateStr(formatDateDisplay(today, true))
    setCheckOutDateStr(formatDateDisplay(tomorrow, false))
  }, [])

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 格式化日期显示
  const formatDateDisplay = (date: Date, isToday: boolean) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[date.getDay()]
    
    if (isToday) {
      return `${month}月${day}日 今天`
    }
    
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return `${month}月${day}日 明天`
    }
    
    return `${month}月${day}日 ${weekDay}`
  }

  // 计算入住天数
  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 1
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 1
  }

  // 跳转到酒店详情页（Banner 广告）
  const handleBannerClick = () => {
    Taro.navigateTo({ url: `/pages/hotel-detail/index?id=${BANNER_HOTEL_ID}` })
  }

  // 定位功能
  const handleLocation = () => {
    Taro.showLoading({ title: '正在定位...' })

    const amap = new AMapWX({ key: AMAP_KEY })
    amap.getRegeo({
      success: (res: any) => {
        const first = Array.isArray(res) ? res[0] : res
        const regeoData = first && first.regeocodeData ? first.regeocodeData : {}
        const addressComponent = (first && first.addressComponent) || (regeoData && regeoData.addressComponent) || {}
        // 尝试解析经纬度，常见情况：regeoData.location = "lng,lat" 或 first.location
        try {
          const locStr = (first && (first.location || first.lonlat)) || (regeoData && regeoData.location) || ''
          if (locStr && typeof locStr === 'string') {
            const parts = locStr.split(',')
            if (parts.length === 2) {
              const lng = parseFloat(parts[0])
              const lat = parseFloat(parts[1])
              if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                setCurrentLat(lat)
                setCurrentLng(lng)
              }
            }
          }
        } catch (e) {
          // ignore
        }
        const city = normalizeCityName(addressComponent.city, addressComponent.province)
        const district = addressComponent.district || ''
        const township = addressComponent.township || ''
        const poiName = (first && first.name) || ''
        const detailAddress = [city, district, township, poiName].filter(Boolean).join(' · ')
        const resolvedCity = city || district || ''

        Taro.hideLoading()
        if (resolvedCity) {
          setCurrentCity(resolvedCity)
        }
        setLocationAddress(detailAddress || resolvedCity || '已定位')
        Taro.showToast({ title: '定位成功', icon: 'success' })
      },
      fail: () => {
        Taro.hideLoading()
        setLocationAddress('定位失败，请检查定位权限')
        Taro.showModal({
          title: '定位失败',
          content: '请检查是否开启定位权限',
          showCancel: false
        })
      }
    })
  }

  // 选择城市
  const handleCitySelect = () => {
    const url = `/pages/search/index?city=${encodeURIComponent(currentCity)}&scene=city`
    Taro.navigateTo({
      url,
      events: {
        keywordSelected: data => {
          if (!data || data.keyword === undefined) return
          if (data.isCity) {
            setCurrentCity(data.keyword)
            setLocationAddress(data.keyword)
            setLocationSuffix('')
          }
        }
      }
    })
  }

  // 打开搜索页
  const openSearchPage = () => {
    const url = `/pages/search/index?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(currentCity)}&scene=keyword`
    Taro.navigateTo({
      url,
      events: {
        keywordSelected: data => {
          if (data && data.keyword !== undefined) {
            if (data.isCity) {
              setCurrentCity(data.keyword)
              setLocationAddress(data.keyword)
              setLocationSuffix('')
              setKeyword('')
            } else {
              setKeyword(data.keyword)
              setLocationSuffix(data.keyword)
            }
          }
        }
      }
    })
  }

  // 跳转到日历页选择日期
  const openDateSelect = () => {
    const url = `/pages/date-select/index?checkIn=${encodeURIComponent(checkInDate)}&checkOut=${encodeURIComponent(checkOutDate)}`
    Taro.navigateTo({
      url,
      events: {
        dateSelected: data => {
          if (!data || !data.checkIn || !data.checkOut) return

          setCheckInDate(data.checkIn)
          setCheckOutDate(data.checkOut)

          const selectedCheckIn = new Date(data.checkIn)
          const selectedCheckOut = new Date(data.checkOut)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          setCheckInDateStr(formatDateDisplay(selectedCheckIn, selectedCheckIn.getTime() === today.getTime()))
          setCheckOutDateStr(formatDateDisplay(selectedCheckOut, false))
          setNightCount(calculateNights(data.checkIn, data.checkOut))
        }
      }
    })
  }

  // 切换标签
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag]
    setSelectedTags(newTags)
    // 点击标签后立即带上该标签进行查询并优先展示含该标签的酒店，优先排序可由后端根据 priorityTag 和位置处理
    navigateToList({ priorityTag: tag, tags: newTags })
  }

  // 查询按钮
  const handleSearch = () => {
    debugLog('handleSearch triggered', {
      currentCity,
      keyword,
      checkInDate,
      checkOutDate,
      nightCount,
      selectedTags
    })

    // 验证必填项
    if (!currentCity) {
      Taro.showToast({ title: '请选择城市', icon: 'none' })
      debugLog('validation failed: empty city')
      return
    }
    
    if (!checkInDate || !checkOutDate) {
      Taro.showToast({ title: '请选择入住日期', icon: 'none' })
      debugLog('validation failed: empty date range')
      return
    }

    // 检查是否过了0点需要选择今天凌晨
    const now = new Date()
    const currentHour = now.getHours()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedCheckIn = new Date(checkInDate)
    selectedCheckIn.setHours(0, 0, 0, 0)
    
    if (currentHour < 6 && selectedCheckIn.getTime() === today.getTime()) {
      debugLog('show midnight reminder modal')
      Taro.showModal({
        title: '提示',
        content: '当前已过0点，如需今天凌晨6点前入住，请选择"今天凌晨"',
        confirmText: '继续查询',
        success: (res) => {
          debugLog('midnight reminder result', res)
          if (res.confirm) {
            navigateToList()
          }
        }
      })
      return
    }
    
    navigateToList()
  }

  // 跳转到列表页
  const navigateToList = (options?: { priorityTag?: string; tags?: string[] }) => {
    const tagsArr = options && options.tags ? options.tags : selectedTags
    const params: Record<string, any> = {
      city: currentCity,
      keyword: keyword,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: nightCount,
      tags: tagsArr.join(',')
    }
    if (options && options.priorityTag) {
      params.priorityTag = options.priorityTag
    }
    if (currentLat && currentLng) {
      params.lat = currentLat
      params.lng = currentLng
    }
    
    const queryString = Object.entries(params)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')

    const url = `/pages/hotel-list/index?${queryString}`
    debugLog('navigateToList start', { params, queryString, url })
    
    Taro.navigateTo({ 
      url,
      success: (res) => {
        debugLog('navigateToList success', res)
      },
      fail: (err) => {
        debugLog('navigateToList fail', err)
        Taro.showModal({
          title: '跳转失败',
          content: (err && err.errMsg) || '无法进入酒店列表页',
          showCancel: false
        })
      }
    })
  }

  useDidShow(() => {
    if (hasAutoLocatedRef.current) return
    hasAutoLocatedRef.current = true
    handleLocation()
  })

  // 登录状态（从本地存储读取）
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 每次页面显示时读取登录信息，确保从登录页返回后状态更新
  useDidShow(() => {
    try {
      const stored = Taro.getStorageSync('user')
      if (stored) setCurrentUser(stored)
      else setCurrentUser(null)
    } catch (e) {
      setCurrentUser(null)
    }
  })

  return (
    <View className='index'>
      {/* 顶部 Banner 广告 */}
      <View className='banner-wrapper'>
        <View className='banner' onClick={handleBannerClick}>
          <Image 
            src={bannerImage}
            className='banner-img'
            mode='aspectFill'
          />
        </View>
      </View>

      {/* 核心查询区域 */}
      <View className='search-container'>
        {/* Tab 切换已移除，仅保留国内 */}

        {/* 城市选择 + 关键字搜索 */}
        <View className='location-detail-window'>
          <Text className='location-detail-title'>当前定位地址</Text>
          <Text className='location-detail-text'>{locationAddress}</Text>
        </View>

        <View className='location-search'>
          <View className='city-selector' onClick={handleCitySelect}>
            <Text className='city-caption'>当前地点</Text>
            <Text className='city-text'>{locationSuffix ? `${currentCity} ${locationSuffix}` : currentCity}</Text>
            <Text className='arrow'>▼</Text>
          </View>
          <View className='search-input-wrapper'>
            <View className='search-input' onClick={openSearchPage}>
              <Text className='search-input-text'>位置/品牌/酒店</Text>
            </View>
          </View>
          <View className='location-icon' onClick={handleLocation}>
            <Text className='icon'>📍</Text>
          </View>
        </View>

        {/* 日期选择 */}
        <View className='date-selector' onClick={openDateSelect}>
          <View className='date-item'>
            <Text className='date-text'>{checkInDateStr || '选择入住日期'}</Text>
          </View>
          <Text className='separator'>—</Text>
          <View className='date-item'>
            <Text className='date-text'>{checkOutDateStr || '选择离店日期'}</Text>
          </View>
          <View className='night-count'>
            <Text>共{nightCount}晚</Text>
          </View>
        </View>

        {/* 入住提示（仅在0-6点显示） */}
        {new Date().getHours() < 6 && (
          <View className='check-in-tip'>
            <Text className='tip-icon'>🌙</Text>
            <Text className='tip-text'>当前已过0点，如需今天凌晨6点前入住，请选择"今天凌晨"</Text>
          </View>
        )}

        {/* 快捷标签 */}
        <View className='quick-tags'>
          {QUICK_TAGS.map(tag => (
            <View 
              key={tag}
              className={`tag-item ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              <Text>{tag}</Text>
            </View>
          ))}
        </View>

        {/* 查询按钮 */}
        <View className='search-button' onClick={handleSearch}>
          <Text className='button-text'>查询</Text>
        </View>
      </View>

      {/* 登录状态展示（位于底部导航之上）+ 底部导航 */}
      {currentUser && (
        <View className='login-status'>已登录: {currentUser.account} {currentUser.role ? `(${currentUser.role})` : ''}</View>
      )}

      <View className='bottom-nav'>
        <View className={`nav-item active`} onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}>
          <Text className='nav-icon'>🏠</Text>
          <Text className='nav-label'>首页</Text>
        </View>
        <View className='nav-item' onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>
          <Text className='nav-icon'>🔐</Text>
          <Text className='nav-label'>登录</Text>
        </View>
      </View>
    </View>
  )
}
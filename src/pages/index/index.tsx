import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'
import bannerImage from '../../assets/icons/hotelExp.jpg'

const DEBUG_HOTEL_FLOW = typeof process !== 'undefined' && process.env
  ? process.env.NODE_ENV !== 'production'
  : true

const debugLog = (...args: any[]) => {
  if (!DEBUG_HOTEL_FLOW) return
  console.log('[HotelFlow][Index]', ...args)
}

const BANNER_HOTEL_ID = 1
const FILTER_OPTIONS = ['不限', '¥0-200', '¥200-500', '¥500以上', '三星及以下', '四星级', '五星级']
const QUICK_TAGS = ['亲子', '豪华', '免费停车场', '含早餐', '近地铁', '高评分', '商务出行']

export default function Index() {
  const [currentCity, setCurrentCity] = useState('上海')
  const [keyword, setKeyword] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [checkInDateStr, setCheckInDateStr] = useState('')
  const [checkOutDateStr, setCheckOutDateStr] = useState('')
  const [nightCount, setNightCount] = useState(1)
  const [selectedTab, setSelectedTab] = useState('国内')
  const [priceRange, setPriceRange] = useState('')
  const [starLevel, setStarLevel] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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
    
    Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        // 实际项目中需要调用逆地理编码 API 获取城市名
        Taro.hideLoading()
        Taro.showToast({ title: '定位成功', icon: 'success' })
        // 模拟定位结果
        setCurrentCity('上海')
      },
      fail: () => {
        Taro.hideLoading()
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
    // 实际项目中应该跳转到城市选择页面
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '苏州', '西安', '重庆']
    Taro.showActionSheet({
      itemList: cities,
      success: (res) => {
        setCurrentCity(cities[res.tapIndex])
      }
    })
  }

  // 打开搜索页
  const openSearchPage = () => {
    const url = `/pages/search/index?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(currentCity)}`
    Taro.navigateTo({
      url,
      events: {
        keywordSelected: data => {
          if (data?.keyword !== undefined) {
            setKeyword(data.keyword)
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
          if (!data?.checkIn || !data?.checkOut) return

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

  // 价格/星级筛选
  const handleFilterClick = () => {
    Taro.showActionSheet({
      itemList: FILTER_OPTIONS,
      success: (res) => {
        const selected = FILTER_OPTIONS[res.tapIndex]
        if (selected === '不限') {
          setPriceRange('')
          setStarLevel('')
        } else {
          if (selected.includes('星')) {
            setStarLevel(selected)
            setPriceRange('')
          } else {
            setPriceRange(selected)
            setStarLevel('')
          }
        }
      }
    })
  }

  // 切换标签
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // 查询按钮
  const handleSearch = () => {
    debugLog('handleSearch triggered', {
      currentCity,
      keyword,
      checkInDate,
      checkOutDate,
      nightCount,
      priceRange,
      starLevel,
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
  const navigateToList = () => {
    const params = {
      city: currentCity,
      keyword: keyword,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: nightCount,
      priceRange: priceRange,
      starLevel: starLevel,
      tags: selectedTags.join(',')
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
          content: err?.errMsg || '无法进入酒店列表页',
          showCancel: false
        })
      }
    })
  }

  useDidShow(() => {
    handleLocation()
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
        {/* Tab 切换 */}
        <View className='tabs'>
          {['国内', '海外', '钟点房', '民宿'].map(tab => (
            <View 
              key={tab}
              className={`tab-item ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              <Text>{tab}</Text>
            </View>
          ))}
        </View>

        {/* 城市选择 + 关键字搜索 */}
        <View className='location-search'>
          <View className='city-selector' onClick={handleCitySelect}>
            <Text className='city-caption'>当前地点</Text>
            <Text className='city-text'>{currentCity}</Text>
            <Text className='arrow'>▼</Text>
          </View>
          <View className='search-input-wrapper'>
            <View className='search-input' onClick={openSearchPage}>
              <Text className='search-input-text'>{keyword || '位置/品牌/酒店'}</Text>
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

        {/* 价格/星级筛选 */}
        <View className='filter-section' onClick={handleFilterClick}>
          <Text className='filter-text'>
            {priceRange || starLevel || '筛选条件：价格/星级'}
          </Text>
        </View>

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
    </View>
  )
}
import { View, Text, Image, Input, Picker } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

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
    Taro.navigateTo({ url: '/pages/hotel-detail/index' })
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

  // 选择入住日期
  const handleCheckInDateChange = (e) => {
    const selectedDate = e.detail.value
    setCheckInDate(selectedDate)
    
    const date = new Date(selectedDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    setCheckInDateStr(formatDateDisplay(date, date.getTime() === today.getTime()))
    
    // 如果入住日期晚于退房日期，自动调整退房日期
    if (selectedDate >= checkOutDate) {
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = formatDate(nextDay)
      setCheckOutDate(nextDayStr)
      setCheckOutDateStr(formatDateDisplay(nextDay, false))
    }
    
    setNightCount(calculateNights(selectedDate, checkOutDate))
  }

  // 选择退房日期
  const handleCheckOutDateChange = (e) => {
    const selectedDate = e.detail.value
    
    // 退房日期必须晚于入住日期
    if (selectedDate <= checkInDate) {
      Taro.showToast({ title: '退房日期必须晚于入住日期', icon: 'none' })
      return
    }
    
    setCheckOutDate(selectedDate)
    const date = new Date(selectedDate)
    setCheckOutDateStr(formatDateDisplay(date, false))
    setNightCount(calculateNights(checkInDate, selectedDate))
  }

  // 价格/星级筛选
  const handleFilterClick = () => {
    Taro.showActionSheet({
      itemList: ['不限', '经济型', '舒适型', '高档型', '豪华型', '三星级', '四星级', '五星级'],
      success: (res) => {
        const filters = ['不限', '经济型', '舒适型', '高档型', '豪华型', '三星级', '四星级', '五星级']
        const selected = filters[res.tapIndex]
        if (selected === '不限') {
          setPriceRange('')
          setStarLevel('')
        } else {
          if (selected.includes('星级')) {
            setStarLevel(selected)
          } else {
            setPriceRange(selected)
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
    // 验证必填项
    if (!currentCity) {
      Taro.showToast({ title: '请选择城市', icon: 'none' })
      return
    }
    
    if (!checkInDate || !checkOutDate) {
      Taro.showToast({ title: '请选择入住日期', icon: 'none' })
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
      Taro.showModal({
        title: '提示',
        content: '当前已过0点，如需今天凌晨6点前入住，请选择"今天凌晨"',
        confirmText: '继续查询',
        success: (res) => {
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
    
    Taro.navigateTo({ 
      url: `/pages/hotel-list/index?${queryString}`
    })
  }

  useDidShow(() => {
    handleLocation()
  })

  return (
    <View className='index'>
      {/* 顶部 Banner 广告 */}
      <View className='banner' onClick={handleBannerClick}>
        <Image 
          src='https://img.zcool.cn/community/01f82e5a3f7cf4a801219b3f4d5e61.jpg@1280w_1l_2o_100sh.jpg'
          className='banner-img'
          mode='aspectFill'
        />
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
            <Text className='city-text'>{currentCity}</Text>
            <Text className='arrow'>▼</Text>
          </View>
          <View className='search-input-wrapper'>
            <Input
              className='search-input'
              placeholder='位置/品牌/酒店'
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
            />
          </View>
          <View className='location-icon' onClick={handleLocation}>
            <Text className='icon'>📍</Text>
          </View>
        </View>

        {/* 日期选择 */}
        <View className='date-selector'>
          <Picker 
            mode='date' 
            value={checkInDate}
            start={formatDate(new Date())}
            onChange={handleCheckInDateChange}
          >
            <View className='date-item'>
              <Text className='date-text'>{checkInDateStr || '选择日期'}</Text>
            </View>
          </Picker>
          <Text className='separator'>—</Text>
          <Picker 
            mode='date' 
            value={checkOutDate}
            start={checkInDate || formatDate(new Date())}
            onChange={handleCheckOutDateChange}
          >
            <View className='date-item'>
              <Text className='date-text'>{checkOutDateStr || '选择日期'}</Text>
            </View>
          </Picker>
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
            {priceRange || starLevel || '价格/星级'}
          </Text>
        </View>

        {/* 快捷标签 */}
        <View className='quick-tags'>
          {['免费停车场', '上海浦东国际机场', '上海虹桥国际机场'].map(tag => (
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
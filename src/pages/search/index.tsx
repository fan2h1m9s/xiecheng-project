import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useMemo, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

import { getHotels, HotelApiItem } from '../../services/hotel'

type SearchTabKey = 'domestic'

// 只保留国内，无tab

const SEARCH_DATA = {
  domestic: ['北京 国贸', '上海 陆家嘴', '广州 珠江新城', '深圳 南山科技园', '杭州 西湖', '成都 春熙路']
}

const DOMESTIC_CITY_GROUPS = [
  { initial: 'B', cities: ['北京'] },
  { initial: 'C', cities: ['成都', '重庆', '长沙'] },
  { initial: 'D', cities: ['大连', '东莞'] },
  { initial: 'F', cities: ['福州'] },
  { initial: 'G', cities: ['广州', '贵阳'] },
  { initial: 'H', cities: ['杭州', '合肥', '哈尔滨'] },
  { initial: 'J', cities: ['济南', '金华'] },
  { initial: 'K', cities: ['昆明'] },
  { initial: 'N', cities: ['南京', '宁波', '南昌'] },
  { initial: 'Q', cities: ['青岛'] },
  { initial: 'S', cities: ['上海', '深圳', '苏州', '沈阳', '石家庄'] },
  { initial: 'T', cities: ['天津', '太原'] },
  { initial: 'W', cities: ['武汉', '无锡', '温州'] },
  { initial: 'X', cities: ['西安', '厦门'] },
  { initial: 'Z', cities: ['郑州', '珠海'] }
]

const OVERSEAS_CITY_GROUPS = [
  { initial: 'D', cities: ['东京', '大阪', '迪拜'] },
  { initial: 'M', cities: ['曼谷', '马尼拉', '马尔代夫'] },
  { initial: 'N', cities: ['纽约', '尼斯'] },
  { initial: 'P', cities: ['巴黎', '普吉岛'] },
  { initial: 'S', cities: ['首尔', '新加坡', '悉尼'] },
  { initial: 'L', cities: ['伦敦', '洛杉矶'] },
  { initial: 'B', cities: ['巴厘岛', '巴塞罗那'] },
]

const safeDecode = (value?: string) => {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch (error) {
    return value
  }
}

export default function SearchPage() {
  const currentInstance = Taro.getCurrentInstance()
  const params = (currentInstance.router && currentInstance.router.params) || {}
  const defaultKeyword = safeDecode(params.keyword)
  const defaultCity = safeDecode(params.city)
  const tabParam = safeDecode(params.tab)
  const scene = safeDecode(params.scene)

  const isCityScene = scene === 'city'

  const [keyword, setKeyword] = useState(defaultKeyword)
  const [scrollIntoId, setScrollIntoId] = useState('city-group-B')
  // 新增：酒店搜索结果
  const [hotelResults, setHotelResults] = useState<HotelApiItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 监听关键词变化，进行数据库搜索
  useEffect(() => {
    if (!keyword.trim()) {
      setHotelResults([])
      setError('')
      return
    }
    setLoading(true)
    setError('')
    getHotels()
      .then(list => {
        // 简单过滤，实际可后端支持关键词搜索
        const filtered = list.filter(hotel =>
          (hotel.hotelNameZh && hotel.hotelNameZh.includes(keyword)) ||
          (hotel.hotelNameEn && hotel.hotelNameEn.toLowerCase().includes(keyword.toLowerCase())) ||
          (hotel.hotelAddress && hotel.hotelAddress.includes(keyword))
        )
        setHotelResults(filtered)
      })
      .catch(e => setError(e.message || '搜索失败'))
      .finally(() => setLoading(false))
  }, [keyword])

  const currentList = useMemo(() => {
    const source = SEARCH_DATA.domestic
    if (!keyword.trim()) return source
    return source.filter(item => item.toLowerCase().includes(keyword.trim().toLowerCase()))
  }, [keyword])

  const domesticGroups = useMemo(() => {
    const normalized = keyword.trim()
    if (!normalized) return DOMESTIC_CITY_GROUPS
    return DOMESTIC_CITY_GROUPS.map(group => ({
      ...group,
      cities: group.cities.filter(city => city.includes(normalized))
    })).filter(group => group.cities.length > 0)
  }, [keyword])

  const domesticLetters = useMemo(() => domesticGroups.map(group => group.initial), [domesticGroups])

  const handleSelectKeyword = (value: string, isCity: boolean = false) => {
    const page = Taro.getCurrentInstance().page
    const channel = page && page.getOpenerEventChannel ? page.getOpenerEventChannel() : null
    if (channel && channel.emit) {
      channel.emit('keywordSelected', { keyword: value, isCity: isCityScene ? true : isCity })
    }
    Taro.navigateBack()
  }

  // 点击酒店条目，跳转到该酒店详情页
  const handleOpenHotel = (hotel: HotelApiItem) => {
    if (!hotel) return
    if (hotel.id !== undefined && hotel.id !== null) {
      Taro.navigateTo({ url: `/pages/hotel-detail/index?id=${hotel.id}` })
      return
    }
    // 回退到选择关键字逻辑（兼容没有 id 的情况）
    handleSelectKeyword(hotel.hotelNameZh || hotel.hotelNameEn || '', false)
  }

  const handleConfirm = () => {
    const normalized = keyword.trim()
    if (!normalized) {
      Taro.showToast({ title: '请输入关键字', icon: 'none' })
      return
    }
    handleSelectKeyword(normalized, isCityScene)
  }

  const jumpToLetter = (letter: string) => {
    setScrollIntoId(`city-group-${letter}`)
  }

  return (
    <View className='search-page'>
      <View className='search-sticky-header'>
        <View className='search-box'>
          <Input
            className='search-input'
            value={keyword}
            placeholder='城市/区域/位置/酒店'
            confirmType='search'
            focus
            onInput={e => setKeyword(e.detail.value)}
            onConfirm={handleConfirm}
          />
        </View>
        {/* 无tab，仅国内城市选择 */}
      </View>

      {/* 只要有关键词，优先展示搜索结果，覆盖内容区 */}
      {keyword.trim() ? (
        <View className='search-content'>
          <Text className='section-title'>搜索结果</Text>
          <View className='result-list'>
            {loading ? (
              <View className='empty-text'>搜索中...</View>
            ) : error ? (
              <View className='empty-text'>{error}</View>
            ) : hotelResults.length > 0 ? (
              hotelResults.map(hotel => (
                <View key={hotel.id} className='result-item' onClick={() => handleOpenHotel(hotel)}>
                  <Text>{hotel.hotelNameZh || hotel.hotelNameEn}</Text>
                  {hotel.hotelAddress && <Text className='hotel-address'>{hotel.hotelAddress}</Text>}
                </View>
              ))
            ) : (
              <View className='empty-text'>未找到相关酒店</View>
            )}
          </View>
        </View>
      ) : (
        <View className='search-content'>
          <Text className='section-title'>选择国内城市</Text>
          <View className='result-list'>
            {domesticGroups.length > 0 ? (
              domesticGroups.map(group => (
                <View key={group.initial} id={`city-group-${group.initial}`} className='city-group'>
                  <View className='city-group-title'>
                    <Text>{group.initial}</Text>
                  </View>
                  <View className='city-group-list'>
                    {group.cities.map(city => (
                      <View key={city} className='city-item' onClick={() => handleSelectKeyword(city, true)}>
                        <Text>{city}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <View className='empty-text'>未找到相关城市</View>
            )}
          </View>
          <View className='letter-index'>
            {domesticLetters.map(letter => (
              <View key={letter} className='letter-item' onClick={() => jumpToLetter(letter)}>
                <Text>{letter}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

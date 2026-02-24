import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

type SearchTabKey = 'domestic' | 'overseas' | 'hot'

const TAB_OPTIONS: { key: SearchTabKey; label: string }[] = [
  { key: 'domestic', label: '国内' },
  { key: 'overseas', label: '海外' },
  { key: 'hot', label: 'xx热搜' }
]

const SEARCH_DATA: Record<SearchTabKey, string[]> = {
  domestic: ['北京 国贸', '上海 陆家嘴', '广州 珠江新城', '深圳 南山科技园', '杭州 西湖', '成都 春熙路'],
  overseas: ['东京 新宿', '大阪 心斋桥', '首尔 明洞', '新加坡 乌节路', '曼谷 暹罗', '巴黎 歌剧院'],
  hot: ['迪士尼度假区', '机场周边', '地铁沿线', '亲子酒店', '温泉酒店', '海景酒店']
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

  const initialTab: SearchTabKey = tabParam === 'overseas' ? 'overseas' : 'domestic'
  const isCityScene = scene === 'city'

  const [keyword, setKeyword] = useState(defaultKeyword)
  const [activeTab, setActiveTab] = useState<SearchTabKey>(initialTab)
  const [scrollIntoId, setScrollIntoId] = useState('city-group-B')

  const currentList = useMemo(() => {
    const source = SEARCH_DATA[activeTab]
    if (!keyword.trim()) return source
    return source.filter(item => item.toLowerCase().includes(keyword.trim().toLowerCase()))
  }, [activeTab, keyword])

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
            placeholder='全球城市/区域/位置/酒店'
            confirmType='search'
            focus
            onInput={e => setKeyword(e.detail.value)}
            onConfirm={handleConfirm}
          />
        </View>
        <View className='search-tabs'>
          {TAB_OPTIONS.map(tab => (
            <View
              key={tab.key}
              className={`search-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {activeTab === 'domestic' ? (
        <View className='domestic-content'>
          <ScrollView
            className='domestic-scroll'
            scrollY
            scrollIntoView={scrollIntoId}
          >
            <View className='domestic-list-wrap'>
              <Text className='section-title'>
                {keyword ? '城市搜索结果' : '选择国内城市'}
              </Text>
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
          </ScrollView>

          <View className='letter-index'>
            {domesticLetters.map(letter => (
              <View key={letter} className='letter-item' onClick={() => jumpToLetter(letter)}>
                <Text>{letter}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className='search-content'>
          <Text className='section-title'>
            {keyword ? '搜索结果' : `${defaultCity || '当前城市'}热门推荐`}
          </Text>
          <View className='result-list'>
            {currentList.length > 0 ? (
              currentList.map(item => (
                <View key={item} className='result-item' onClick={() => handleSelectKeyword(item, false)}>
                  <Text>{item}</Text>
                </View>
              ))
            ) : (
              <View className='empty-text'>未找到相关结果</View>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

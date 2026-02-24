import { View, Text, Input } from '@tarojs/components'
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

const safeDecode = (value?: string) => {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch (error) {
    return value
  }
}

export default function SearchPage() {
  const params = Taro.getCurrentInstance().router?.params || {}
  const defaultKeyword = safeDecode(params.keyword)
  const defaultCity = safeDecode(params.city)

  const [keyword, setKeyword] = useState(defaultKeyword)
  const [activeTab, setActiveTab] = useState<SearchTabKey>('domestic')

  const currentList = useMemo(() => {
    const source = SEARCH_DATA[activeTab]
    if (!keyword.trim()) return source
    return source.filter(item => item.toLowerCase().includes(keyword.trim().toLowerCase()))
  }, [activeTab, keyword])

  const handleSelectKeyword = (value: string) => {
    const channel = Taro.getCurrentInstance().page?.getOpenerEventChannel?.()
    channel?.emit('keywordSelected', { keyword: value })
    Taro.navigateBack()
  }

  const handleConfirm = () => {
    const normalized = keyword.trim()
    if (!normalized) {
      Taro.showToast({ title: '请输入关键字', icon: 'none' })
      return
    }
    handleSelectKeyword(normalized)
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

      <View className='search-content'>
        <Text className='section-title'>
          {keyword ? '搜索结果' : `${defaultCity || '当前城市'}热门推荐`}
        </Text>
        <View className='result-list'>
          {currentList.length > 0 ? (
            currentList.map(item => (
              <View key={item} className='result-item' onClick={() => handleSelectKeyword(item)}>
                <Text>{item}</Text>
              </View>
            ))
          ) : (
            <View className='empty-text'>未找到相关结果</View>
          )}
        </View>
      </View>
    </View>
  )
}

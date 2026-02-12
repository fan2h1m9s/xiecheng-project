import { View, Text } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

const cityList = ['深圳', '北京', '上海', '广州', '杭州', '成都', '南京', '武汉', '西安']

export default function CitySelect() {
  const params = Taro.getCurrentInstance().router?.params
  const currentCity = params?.city || ''

  const handleSelect = (city: string) => {
    const channel = Taro.getCurrentInstance().page?.getOpenerEventChannel?.()
    channel?.emit('citySelected', { city })
    Taro.navigateBack()
  }

  return (
    <View className="city-select-page">
      <View className="city-list">
        {cityList.map(city => (
          <View
            key={city}
            className={`city-item ${city === currentCity ? 'active' : ''}`}
            onClick={() => handleSelect(city)}
          >
            <Text>{city}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

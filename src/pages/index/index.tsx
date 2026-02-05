import { View, Text, Image } from '@tarojs/components'
import './index.scss'

export default function Index() {
  return (
    <View className='index'>
      {/* 顶部 Banner */}
      <View className='banner'>
        <Image 
          src='https://img.zcool.cn/community/01f82e5a3f7cf4a801219b3f4d5e61.jpg@1280w_1l_2o_100sh.jpg'
          className='banner-img'
          mode='widthFix'
        />
        <View className='banner-text'>
          <Text className='title'>酒店预订</Text>
          <Text className='subtitle'>轻松预订，舒心入住</Text>
        </View>
      </View>

      {/* 搜索区域 */}
      <View className='search-box'>
        <View className='search-item'>
          <Text className='label'>目的地</Text>
          <Text className='value'>选择城市/酒店</Text>
        </View>
        <View className='search-item'>
          <Text className='label'>入住时间</Text>
          <Text className='value'>今天</Text>
        </View>
        <View className='search-item'>
          <Text className='label'>退房时间</Text>
          <Text className='value'>明天</Text>
        </View>
        <View className='search-btn'>搜索</View>
      </View>

      {/* 热门城市 */}
      <View className='section'>
        <Text className='section-title'>热门城市</Text>
        <View className='city-list'>
          {['北京', '上海', '广州', '深圳', '杭州', '成都'].map(city => (
            <View key={city} className='city-item'>
              <Text>{city}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 酒店类型 */}
      <View className='section'>
        <Text className='section-title'>酒店类型</Text>
        <View className='type-list'>
          <View className='type-item'>
            <View className='type-icon'>🏨</View>
            <Text>商务酒店</Text>
          </View>
          <View className='type-item'>
            <View className='type-icon'>🏠</View>
            <Text>民宿客栈</Text>
          </View>
          <View className='type-item'>
            <View className='type-icon'>⭐</View>
            <Text>星级酒店</Text>
          </View>
          <View className='type-item'>
            <View className='type-icon'>🌊</View>
            <Text>海景酒店</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
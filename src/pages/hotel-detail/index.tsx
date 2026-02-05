import { View, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function HotelDetail() {
  return (
    <View>
      <View>酒店详情页</View>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/hotel-list/index' })}>
        返回酒店列表页
      </Button>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>
        返回酒店查询页
      </Button>
    </View>
  )
}

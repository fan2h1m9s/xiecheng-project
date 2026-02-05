import { View, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function HotelList() {
  return (
    <View>
      <View>酒店列表页</View>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/hotel-detail/index' })}>
        跳转到酒店详情页
      </Button>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>
        返回酒店查询页
      </Button>
    </View>
  )
}

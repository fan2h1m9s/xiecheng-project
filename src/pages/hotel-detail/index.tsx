import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

type HotelDetail = {
  id: number
  name: string
  address: string
  price: number
  rating: number
  cover: string
  tags: string[]
  highlights: string[]
  description: string
}

const MOCK_DETAILS: HotelDetail[] = [
  {
    id: 101,
    name: '城央臻选酒店',
    address: '福田区福华一路 88 号',
    price: 528,
    rating: 4.7,
    cover: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['地铁直达', '商务出行', '自助早餐'],
    highlights: ['24 小时前台服务', '高空景观酒廊', '健身房与洗衣房'],
    description:
      '酒店位于福田核心商务区，步行可达会展中心。客房采用简约设计与智能控制，提供舒适睡眠体验。'
  },
  {
    id: 102,
    name: '云际观景酒店',
    address: '福田区金田路 18 号',
    price: 688,
    rating: 4.8,
    cover: 'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['城市景观', '情侣优选', '高层泳池'],
    highlights: ['空中无边际泳池', '行政酒廊', '大堂咖啡吧'],
    description:
      '坐拥城市天际线与湾区夜景，配备高端餐饮与休闲设施，适合度假与高端商务接待。'
  },
  {
    id: 103,
    name: '湾畔逸居酒店',
    address: '福田区深南大道 3008 号',
    price: 458,
    rating: 4.5,
    cover: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['亲子友好', '免费停车', '近商圈'],
    highlights: ['亲子活动区', '智能门锁', '快速退房'],
    description:
      '毗邻大型商圈与公园，提供丰富亲子配套及便捷出行服务，适合家庭与轻度度假人群。'
  }
]

export default function HotelDetail() {
  const params = Taro.getCurrentInstance().router?.params || {}
  const hotelId = Number(params.id)
  const detail =
    MOCK_DETAILS.find(item => item.id === hotelId) ||
    ({
      id: 0,
      name: '酒店详情',
      address: '暂未获取酒店地址',
      price: 0,
      rating: 0,
      cover:
        'https://images.pexels.com/photos/261156/pexels-photo-261156.jpeg?auto=compress&cs=tinysrgb&w=1200',
      tags: ['待接入数据库'],
      highlights: ['酒店信息将从数据库获取'],
      description: '当前展示为本地模拟数据，后续将替换为真实酒店详情。'
    } as HotelDetail)

  return (
    <View className="hotel-detail-page">
      <Image className="detail-hero" src={detail.cover} mode="aspectFill" />
      <View className="detail-body">
        <View className="detail-title-row">
          <View className="detail-title">{detail.name}</View>
          <View className="detail-rating">{detail.rating.toFixed(1)} 分</View>
        </View>
        <View className="detail-address">{detail.address}</View>
        <View className="detail-price">¥{detail.price} 起 / 晚</View>

        <View className="detail-tags">
          {detail.tags.map(tag => (
            <Text className="detail-tag" key={tag}>
              {tag}
            </Text>
          ))}
        </View>

        <View className="detail-section">
          <View className="detail-section-title">亮点服务</View>
          <View className="detail-list">
            {detail.highlights.map(item => (
              <View className="detail-list-item" key={item}>
                {item}
              </View>
            ))}
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-section-title">酒店介绍</View>
          <View className="detail-description">{detail.description}</View>
        </View>
      </View>
    </View>
  )
}

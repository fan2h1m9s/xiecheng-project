import { View, Map, CoverView, CoverImage, Image, ScrollView, Text } from '@tarojs/components'
import React, { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { AMAP_KEY } from '../../config/map-keys'
import hotelCover from '../../assets/icons/hotelExp.jpg'
import { getHotels, type HotelApiItem } from '../../services/hotel'

const { AMapWX } = require('../../utils/amap-wx')

const DEFAULT_COORD = {
  latitude: 22.543096,
  longitude: 114.057865
}

type HotelItem = {
  id: number
  name: string
  latitude: number
  longitude: number
  address: string
  price: number
  rating: number
  cover: string
}

const normalizeHotelForMap = (hotel: HotelApiItem, index: number): HotelItem => {
  const stars = Number(hotel.hotelStars || 0)
  const parsedLatitude = Number(hotel.latitude)
  const parsedLongitude = Number(hotel.longitude)
  const hasGeo = Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude)
  return {
    id: hotel.id,
    name: hotel.hotelNameZh || hotel.hotelNameEn || '未命名酒店',
    latitude: hasGeo ? parsedLatitude : DEFAULT_COORD.latitude + (index % 3) * 0.002 - 0.002,
    longitude: hasGeo ? parsedLongitude : DEFAULT_COORD.longitude + (index % 3) * 0.002 - 0.002,
    address: hotel.hotelAddress || '暂无地址信息',
    price: 0,
    rating: stars > 0 ? Math.min(5, Number((stars / 2).toFixed(1))) : 4.5,
    cover: hotelCover
  }
}

export default function HotelMap() {
  const [center, setCenter] = useState(DEFAULT_COORD)
  const [address, setAddress] = useState('定位中')
  const [selectedHotel, setSelectedHotel] = useState<HotelItem | null>(null)
  const [hotels, setHotels] = useState<HotelItem[]>([])
  const scale = 14
  const useHighAccuracy = true

  const circles = useMemo(
    () =>
      hotels.map(hotel => ({
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        color: '#ff3b30',
        fillColor: '#ff3b304d',
        radius: 30,
        strokeWidth: 2
      })),
    [hotels]
  )

  const locate = () => {
    const amap = new AMapWX({ key: AMAP_KEY })
    Taro.getLocation({
      type: 'gcj02',
      isHighAccuracy: useHighAccuracy,
      highAccuracyExpireTime: 3000,
      success: res => {
        const lng = res.longitude
        const lat = res.latitude
        setCenter({ latitude: lat, longitude: lng })
        amap.getRegeo({
          location: `${lng},${lat}`,
          success: (geoRes: any) => {
            const first = Array.isArray(geoRes) ? geoRes[0] : geoRes
            const name = first && first.name ? first.name : ''
            const desc = first && first.desc ? first.desc : ''
            const display = [name, desc].filter(Boolean).join(' · ')
            setAddress(display || '已定位')
          },
          fail: (err: any) => {
            setAddress('定位失败')
            Taro.showToast({ title: '定位失败，请检查权限', icon: 'none' })
          }
        })
      },
      fail: err => {
        setAddress('定位失败')
        Taro.showToast({ title: '定位失败，请检查权限', icon: 'none' })
      }
    })
  }

  const calcDistanceMeters = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const toRad = (val: number) => (val * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const radLat1 = toRad(lat1)
    const radLat2 = toRad(lat2)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return 6371000 * c
  }

  const handleMapTap = (event: any) => {
    const detail = event && event.detail ? event.detail : null
    const latitude = detail ? detail.latitude : undefined
    const longitude = detail ? detail.longitude : undefined
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return
    let nearest: { hotel: HotelItem; distance: number } | null = null
    hotels.forEach(hotel => {
      const distance = calcDistanceMeters(latitude, longitude, hotel.latitude, hotel.longitude)
      if (!nearest || distance < nearest.distance) {
        nearest = { hotel, distance }
      }
    })
    if (nearest && nearest.distance <= 150) {
      setSelectedHotel(nearest.hotel)
      setCenter({ latitude: nearest.hotel.latitude, longitude: nearest.hotel.longitude })
    }
  }

  const handleOpenDetail = () => {
    if (!selectedHotel) return
    Taro.navigateTo({
      url: `/pages/hotel-detail/index?id=${selectedHotel.id}`
    })
  }

  useEffect(() => {
    locate()
  }, [])

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await getHotels()
        const list = data.map(normalizeHotelForMap)
        setHotels(list)
        if (list.length > 0) {
          setCenter({ latitude: list[0].latitude, longitude: list[0].longitude })
        }
      } catch (error) {
        Taro.showToast({ title: '酒店地图数据加载失败', icon: 'none' })
      }
    }

    loadHotels()
  }, [])

  return (
    <View className="hotel-map-page">
      <View className="map-container">
        <Map
          className="map-view"
          latitude={center.latitude}
          longitude={center.longitude}
          scale={scale}
          showLocation
          circles={circles}
          onTap={handleMapTap}
        />
        <CoverView className="map-header">
          <CoverView className="map-info">
            <CoverView className="map-title">高德地图</CoverView>
            <CoverView className="map-subtitle">{address}</CoverView>
          </CoverView>
        </CoverView>
        {selectedHotel && (
          <CoverView className="map-card">
            <CoverImage className="map-card-thumb" src={selectedHotel.cover} />
            <CoverView className="map-card-body">
              <CoverView className="map-card-title">{selectedHotel.name}</CoverView>
              <CoverView className="map-card-address">{selectedHotel.address}</CoverView>
              <CoverView className="map-card-meta">
                <CoverView className="map-card-rating">{selectedHotel.rating} 分</CoverView>
                <CoverView className="map-card-price">¥{selectedHotel.price} 起</CoverView>
              </CoverView>
            </CoverView>
            <CoverView className="map-card-actions">
              <CoverView className="map-card-button" onClick={handleOpenDetail}>
                查看详情
              </CoverView>
              <CoverView className="map-card-close" onClick={() => setSelectedHotel(null)}>
                关闭
              </CoverView>
            </CoverView>
          </CoverView>
        )}
      </View>
      <View className="debug-card-panel">
        <View className="debug-card-title">调试酒店卡片</View>
        <ScrollView className="debug-card-list" scrollX>
          {hotels.map(hotel => (
            <View
              className="debug-card-item"
              key={hotel.id}
              onClick={() => {
                setSelectedHotel(hotel)
                setCenter({ latitude: hotel.latitude, longitude: hotel.longitude })
              }}
            >
              <Image className="debug-card-thumb" src={hotel.cover} mode="aspectFill" />
              <View className="debug-card-body">
                <View className="debug-card-name">{hotel.name}</View>
                <View className="debug-card-address">{hotel.address}</View>
                <View className="debug-card-meta">
                  <Text className="debug-card-rating">{hotel.rating} 分</Text>
                  <Text className="debug-card-price">¥{hotel.price} 起</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

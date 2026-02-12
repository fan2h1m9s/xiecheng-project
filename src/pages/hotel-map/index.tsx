import { View, Map, CoverView } from '@tarojs/components'
import React, { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { AMAP_KEY } from '../../config/map-keys'

const { AMapWX } = require('../../utils/amap-wx')

const DEFAULT_COORD = {
  latitude: 22.543096,
  longitude: 114.057865
}

export default function HotelMap() {
  const [center, setCenter] = useState(DEFAULT_COORD)
  const [address, setAddress] = useState('定位中')
  const [scale, setScale] = useState(14)
  const [diagText, setDiagText] = useState('')
  const [useHighAccuracy, setUseHighAccuracy] = useState(true)
  const [activeButton, setActiveButton] = useState('')

  const formatAccuracy = (accuracy?: number) => {
    if (typeof accuracy !== 'number') return 'unknown'
    return `${Math.round(accuracy)}m`
  }

  const setDiag = (lines: string[]) => {
    setDiagText(lines.filter(Boolean).join('\n'))
  }

  const locate = () => {
    const amap = new AMapWX({ key: AMAP_KEY })
    Taro.getLocation({
      type: 'gcj02',
      isHighAccuracy: useHighAccuracy,
      highAccuracyExpireTime: 3000,
      success: res => {
        const lng = res.longitude
        const lat = res.latitude
        const accuracy = res.accuracy
        setCenter({ latitude: lat, longitude: lng })
        amap.getRegeo({
          location: `${lng},${lat}`,
          success: (geoRes: any) => {
            const first = Array.isArray(geoRes) ? geoRes[0] : geoRes
            const name = first && first.name ? first.name : ''
            const desc = first && first.desc ? first.desc : ''
            const display = [name, desc].filter(Boolean).join(' · ')
            setAddress(display || '已定位')
            setDiag([
              `wx.getLocation ok: ${lat}, ${lng}`,
              `accuracy: ${formatAccuracy(accuracy)}`,
              `highAccuracy: ${useHighAccuracy ? 'on' : 'off'}`,
              `amap regeo: ${display || 'ok'}`
            ])
          },
          fail: (err: any) => {
            setAddress('定位失败')
            const msg = err && err.errMsg ? err.errMsg : 'AMapWX getRegeo failed'
            setDiag([
              `wx.getLocation ok: ${lat}, ${lng}`,
              `accuracy: ${formatAccuracy(accuracy)}`,
              `highAccuracy: ${useHighAccuracy ? 'on' : 'off'}`,
              `amap regeo fail: ${msg}`
            ])
            Taro.showToast({ title: '定位失败，请检查权限', icon: 'none' })
          }
        })
      },
      fail: err => {
        setAddress('定位失败')
        const msg = err && err.errMsg ? err.errMsg : 'wx.getLocation failed'
        setDiag([
          `wx.getLocation fail: ${msg}`
        ])
        Taro.showToast({ title: '定位失败，请检查权限', icon: 'none' })
      }
    })
  }

  const diagnose = () => {
    Taro.getLocation({
      type: 'gcj02',
      isHighAccuracy: useHighAccuracy,
      highAccuracyExpireTime: 3000,
      success: res => {
        setDiag([
          `wx.getLocation ok: ${res.latitude}, ${res.longitude}`,
          `accuracy: ${formatAccuracy(res.accuracy)}`,
          `highAccuracy: ${useHighAccuracy ? 'on' : 'off'}`
        ])
      },
      fail: err => {
        const msg = err && err.errMsg ? err.errMsg : 'wx.getLocation failed'
        setDiag([
          `wx.getLocation fail: ${msg}`
        ])
      }
    })
  }

  useEffect(() => {
    locate()
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
          onError={(err) => {
            console.error('Map error:', err)
          }}
        />
        <CoverView className="map-header">
          <CoverView className="map-info">
            <CoverView className="map-title">高德地图</CoverView>
            <CoverView className="map-subtitle">{address}</CoverView>
          </CoverView>
          <CoverView className="map-actions">
            <CoverView
              className={`map-button ${activeButton === 'locate' ? 'active' : ''}`}
              onTouchStart={() => setActiveButton('locate')}
              onTouchEnd={() => setActiveButton('')}
              onClick={locate}
            >
              重新定位
            </CoverView>
            <CoverView
              className={`map-button ${activeButton === 'diagnose' ? 'active' : ''}`}
              onTouchStart={() => setActiveButton('diagnose')}
              onTouchEnd={() => setActiveButton('')}
              onClick={diagnose}
            >
              定位诊断
            </CoverView>
            <CoverView
              className={`map-button ${useHighAccuracy ? 'on' : ''} ${activeButton === 'accuracy' ? 'active' : ''}`}
              onTouchStart={() => setActiveButton('accuracy')}
              onTouchEnd={() => setActiveButton('')}
              onClick={() => setUseHighAccuracy(prev => !prev)}
            >
              {useHighAccuracy ? '高精度:开' : '高精度:关'}
            </CoverView>
          </CoverView>
        </CoverView>
        {diagText ? (
          <CoverView className="map-diagnose">
            <CoverView className="map-diagnose-text">{diagText}</CoverView>
          </CoverView>
        ) : null}
      </View>
    </View>
  )
}

import { View, Text, Picker, Button } from '@tarojs/components'
import React, { useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function DateSelect() {
  const params = Taro.getCurrentInstance().router?.params
  const [checkInDate, setCheckInDate] = useState(params?.checkIn || '')
  const [checkOutDate, setCheckOutDate] = useState(params?.checkOut || '')

  const nights = useMemo(() => {
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
    return Math.max(0, diffDays)
  }, [checkInDate, checkOutDate])

  const handleConfirm = () => {
    const channel = Taro.getCurrentInstance().page?.getOpenerEventChannel?.()
    channel?.emit('dateSelected', { checkIn: checkInDate, checkOut: checkOutDate })
    Taro.navigateBack()
  }

  return (
    <View className="date-select-page">
      <View className="date-card">
        <View className="date-row">
          <Text className="date-label">入住日期</Text>
          <Picker mode="date" value={checkInDate} onChange={e => setCheckInDate(e.detail.value)}>
            <Text className="date-value">{checkInDate || '请选择'}</Text>
          </Picker>
        </View>
        <View className="date-row">
          <Text className="date-label">退房日期</Text>
          <Picker mode="date" value={checkOutDate} onChange={e => setCheckOutDate(e.detail.value)}>
            <Text className="date-value">{checkOutDate || '请选择'}</Text>
          </Picker>
        </View>
        <View className="date-summary">共{nights}晚</View>
      </View>
      <Button className="date-confirm" onClick={handleConfirm}>确认</Button>
    </View>
  )
}

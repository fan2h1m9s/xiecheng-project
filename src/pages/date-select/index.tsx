import { View, Text } from '@tarojs/components'
import React, { useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function DateSelect() {
  const params = Taro.getCurrentInstance().router?.params
  const [checkInDate, setCheckInDate] = useState(params?.checkIn || '')
  const [checkOutDate, setCheckOutDate] = useState(params?.checkOut || '')

  const parseDate = (value: string) => {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
  }

  const formatDate = (value: Date) => {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const nights = useMemo(() => {
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
    if (diffDays === 0) return 1
    return Math.max(0, diffDays)
  }, [checkInDate, checkOutDate])

  const holidayByMonthDay: Record<string, string> = {
    '01-01': '元旦',
    '02-14': '情人节',
    '03-08': '妇女节',
    '04-05': '清明',
    '05-01': '劳动节',
    '06-01': '儿童节',
    '10-01': '国庆',
    '12-25': '圣诞'
  }

  const holidayByDate: Record<string, string> = {
    '2026-02-17': '春节',
    '2026-02-18': '春节',
    '2026-02-19': '春节'
  }

  const getHolidayLabel = (value: Date) => {
    const dateKey = formatDate(value)
    const fixed = holidayByDate[dateKey] || holidayByMonthDay[dateKey.slice(5)]
    if (fixed) return fixed
    const weekday = value.getDay()
    return weekday === 0 || weekday === 6 ? '周末' : ''
  }

  const buildCalendarCells = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const firstWeekday = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = [] as Array<{
      date: Date | null
      inCurrentMonth: boolean
    }>

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ date: null, inCurrentMonth: false })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(year, month, day)
      cells.push({ date: cellDate, inCurrentMonth: true })
    }

    return cells
  }

  const monthList = useMemo(() => {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return Array.from({ length: 12 }, (_, index) => (
      new Date(start.getFullYear(), start.getMonth() + index, 1)
    ))
  }, [today])

  const isPastDate = (value: Date) => value.getTime() < today.getTime()

  const submitSelection = (checkIn: string, checkOut: string) => {
    const channel = Taro.getCurrentInstance().page?.getOpenerEventChannel?.()
    channel?.emit('dateSelected', { checkIn, checkOut })
    Taro.navigateBack()
  }

  const handleSelectDate = (value: Date) => {
    if (isPastDate(value)) return
    const dateStr = formatDate(value)

    if (!checkInDate) {
      setCheckInDate(dateStr)
      setCheckOutDate('')
      return
    }

    if (!checkOutDate) {
      if (dateStr < checkInDate) {
        setCheckInDate(dateStr)
        return
      }
      if (dateStr === checkInDate) {
        Taro.showToast({ title: '住一晚', icon: 'none' })
      }
      setCheckOutDate(dateStr)
      submitSelection(checkInDate, dateStr)
      return
    }
    setCheckInDate(dateStr)
    setCheckOutDate('')
  }

  const isSameDate = (value: Date, compare: string) => compare === formatDate(value)

  const isInRange = (value: Date) => {
    if (!checkInDate || !checkOutDate) return false
    const dateStr = formatDate(value)
    return dateStr > checkInDate && dateStr < checkOutDate
  }

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']


  return (
    <View className="date-select-page">
      <View className="date-card">
        {monthList.map((monthDate, monthIndex) => {
          const year = monthDate.getFullYear()
          const month = monthDate.getMonth()
          const monthKey = `${year}-${month + 1}`
          const cells = buildCalendarCells(year, month)

          return (
            <React.Fragment key={monthKey}>
              <View className="month-section">
                <View className="calendar-header">
                  <Text className="month-label">{year}年{month + 1}月</Text>
                </View>
                <View className="weekday-row">
                  {weekdays.map(day => (
                    <Text className="weekday-cell" key={`${monthKey}-${day}`}>{day}</Text>
                  ))}
                </View>
                <View className="calendar-grid">
                  {cells.map((cell, cellIndex) => {
                    const { date, inCurrentMonth } = cell
                    const isEmpty = !date
                    const dateKey = date ? formatDate(date) : `empty-${monthIndex}-${cellIndex}`
                    const isStart = date ? isSameDate(date, checkInDate) : false
                    const isEnd = date ? isSameDate(date, checkOutDate) : false
                    const inRange = date ? isInRange(date) : false
                    const isToday = date ? date.getTime() === today.getTime() : false
                    const holiday = date ? getHolidayLabel(date) : ''
                    const disabled = date ? isPastDate(date) : true
                    const showCheckInTag = isStart && !checkOutDate
                    const className = [
                      'day-cell',
                      inCurrentMonth ? 'current' : 'adjacent',
                      isStart ? 'start' : '',
                      isEnd ? 'end' : '',
                      inRange ? 'range' : '',
                      disabled ? 'disabled' : '',
                      isEmpty ? 'empty' : ''
                    ].filter(Boolean).join(' ')

                    return (
                      <View
                        key={`${monthIndex}-${dateKey}`}
                        className={className}
                        onClick={() => {
                          if (date) handleSelectDate(date)
                        }}
                      >
                        {!isEmpty && (
                          <>
                            <Text className="day-number">{date.getDate()}</Text>
                            {showCheckInTag && <Text className="day-tag day-tag-select">入住</Text>}
                            {showCheckInTag && (
                              <View className="checkout-pop">
                                <Text className="checkout-pop-text">请选择离店日期</Text>
                              </View>
                            )}
                            {!showCheckInTag && holiday && <Text className="day-tag">{holiday}</Text>}
                            {!showCheckInTag && !holiday && isToday && <Text className="day-tag">今天</Text>}
                          </>
                        )}
                      </View>
                    )}
                  )}
                </View>
              </View>
            </React.Fragment>
          )
        })}
      </View>
    </View>
  )
}

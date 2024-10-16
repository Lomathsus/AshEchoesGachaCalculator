import dayjs from 'dayjs'

// 生成时间区间函数
export default function generate30DayIntervals(startDate = '2024-01-01') {
  const intervals = []
  let currentDate = dayjs(startDate, 'YYYY-MM-DD')
  const now = dayjs()

  while (currentDate.isBefore(now)) {
    const startOfPeriod = currentDate.startOf('day').unix()
    const endOfPeriod = currentDate.add(29, 'days').endOf('day').unix()
    intervals.push([startOfPeriod, endOfPeriod])
    currentDate = currentDate.add(30, 'days')
  }

  // 如果最后一个区间的结束时间超出了当前日期，则修正最后一个区间
  const lastInterval = intervals[intervals.length - 1]
  if (lastInterval[1] > now.unix()) {
    lastInterval[1] = now.endOf('day').unix()
  }

  return intervals
}

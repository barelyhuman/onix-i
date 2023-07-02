import parse from 'date-fns/parse'
import format from 'date-fns/format'

export const startOf = date => {
  return new Date(new Date(date).setHours(0, 0, 0, 0))
}

export const endOf = date => {
  return new Date(new Date(date).setHours(23, 59, 59))
}

export const startOfMonth = date => {
  return new Date(new Date(date).setDate(1))
}

export const getNumberOfDays = (year, month) => {
  return 50 - new Date(new Date(year, month, 50).getDate())
}

export const endOfMonth = date => {
  const startDate = startOfMonth(date)
  const numberOfDays = getNumberOfDays(
    startDate.getFullYear(),
    startDate.getMonth()
  )
  const endDate = new Date(
    new Date(startDate).setDate(new Date(startDate).getDate() + numberOfDays)
  )
  return endDate
}

export const toMinutes = seconds => {
  return (seconds / 60).toFixed(2)
}

export const toHours = seconds => {
  return (toMinutes(seconds) / 60).toFixed(2)
}

export const parseDateString = datestring => {
  const parserFormats = ['dd/MM/yyyy']
  const validDate = parserFormats
    .map(format => {
      try {
        const val = parse(datestring, format, new Date())
        return String(val).startsWith('Invalid Date') ? null : val
      } catch (err) {
        console.log({ err })
        return null
      }
    })
    .find(x => x)

  return validDate
}

export const formatDate = date => {
  return format(new Date(date), 'dd/MM/yyyy')
}

export function millisecondsToTimeSpent(timeinMills) {
  const secs = 1000
  const mins = secs * 60
  const hours = mins * 60

  const secondsPassed = Math.floor(timeinMills / secs)
  const minutesPassed = Math.floor(timeinMills / mins)
  const hoursPassed = Math.floor(timeinMills / hours)

  const hoursSpent = hoursPassed
  const minutesSpent = (minutesPassed * mins - hoursPassed * hours) / mins
  const secondsSpent = (secondsPassed * secs - minutesPassed * mins) / secs

  return {
    hours: hoursSpent,
    minutes: minutesSpent,
    seconds: secondsSpent,
  }
}

export function formatTimeSpent(timeinMills) {
  const convertedValues = millisecondsToTimeSpent(timeinMills)
  return `${padTime(convertedValues.hours)}h : ${padTime(
    convertedValues.minutes
  )}m : ${padTime(convertedValues.seconds)}s `
}

function padTime(time) {
  return time < 10 ? `0${time}` : time
}

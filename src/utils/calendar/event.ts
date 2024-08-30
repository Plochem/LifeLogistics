import dayjs from 'dayjs'

export const isAllDay = (e: IEvent) =>
  dayjs(e.startTime).diff(e.endTime, 'day') === 0 &&
  dayjs(e.startTime).startOf('day').isSame(e.startTime) &&
  dayjs(e.endTime).endOf('day').isSame(e.endTime)

export const dateStringNoSec = (d: Date) =>
  d.toLocaleString([], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const populateDateObjs = (e: IEvent) => {
  const res = {
    ...e,
    startTime: new Date(e.startTime),
    endTime: new Date(e.endTime),
  }
  if (res.rrule) {
    if (res.rrule.dtstart) {
      res.rrule.dtstart = new Date(res.rrule.dtstart)
    }
    if (res.rrule.until) {
      res.rrule.until = new Date(res.rrule.until)
    }
  }
  return res
}

// converts day of week where week starts on a sunday to a week where it starts on monday
export const sundayWeekToMonday = (dayOfWeek: number) =>
  dayOfWeek - 1 < 0 ? 6 : dayOfWeek - 1

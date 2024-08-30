import dayjs from 'dayjs'
import { saveAs } from 'file-saver'
import ical, { ICalEventRepeatingFreq, ICalWeekday } from 'ical-generator'
import { RRule } from 'rrule'

import { isAllDay } from './event'

import type { Frequency } from 'rrule'

const freqToICalMap: Record<Frequency, ICalEventRepeatingFreq> = {
  [RRule.YEARLY]: ICalEventRepeatingFreq.YEARLY,
  [RRule.MONTHLY]: ICalEventRepeatingFreq.MONTHLY,
  [RRule.WEEKLY]: ICalEventRepeatingFreq.WEEKLY,
  [RRule.DAILY]: ICalEventRepeatingFreq.DAILY,
  [RRule.HOURLY]: ICalEventRepeatingFreq.HOURLY,
  [RRule.MINUTELY]: ICalEventRepeatingFreq.MINUTELY,
  [RRule.SECONDLY]: ICalEventRepeatingFreq.SECONDLY,
}

const dayToICalMap: Record<number, ICalWeekday> = {
  0: ICalWeekday.MO,
  1: ICalWeekday.TU,
  2: ICalWeekday.WE,
  3: ICalWeekday.TH,
  4: ICalWeekday.FR,
  5: ICalWeekday.SA,
  6: ICalWeekday.SU,
}

const exportCalendar = (calendar: ICalendar) => {
  // create calendar
  const iCal = ical({ name: calendar.name, description: calendar.description })

  calendar.events.forEach((event) => {
    const { startTime, endTime, description, title } = event

    if (event.rrule) {
      const rule = new RRule(event.rrule)
      const startDate = rule.after(new Date(startTime), true)
      const duration = dayjs(endTime).diff(startTime, 'milliseconds')
      const endDate = dayjs(startDate).add(duration, 'milliseconds').toDate()

      const iCalEvent = iCal.createEvent({
        start: startDate ?? startTime,
        end: endDate ?? endTime,
        description,
        summary: title,
        allDay: isAllDay(event),
      })

      const {
        freq,
        byweekday,
        bymonth,
        bymonthday,
        bysetpos,
        count,
        interval,
        until,
      } = event.rrule

      iCalEvent.repeating({
        freq: freqToICalMap[freq],
        interval,
        ...(count && { count }),
        ...(until && { until }),
        ...(byweekday?.length > 0 && {
          byDay: byweekday.map((i) => dayToICalMap[i]),
        }),
        ...(bymonth?.length > 0 && { byMonth: bymonth }),
        ...(bymonthday?.length > 0 && { byMonthDay: bymonthday }),
        ...(bysetpos?.length && { bySetPos: bysetpos }),
      })
    } else {
      iCal.createEvent({
        start: startTime,
        end: endTime,
        description,
        summary: title,
        allDay: isAllDay(event),
      })
    }
  })

  const blob = iCal.toBlob()
  saveAs(blob, `${calendar.name}.ics`)
}

export default exportCalendar

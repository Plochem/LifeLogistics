import dayjs from 'dayjs'
import ICAL from 'ical.js'
import { RRule } from 'rrule'

import type { Frequency, Weekday } from 'rrule'

const parseICal = (data: string): DeepPartial<ICalendar> => {
  let calData = []
  calData = ICAL.parse(data)

  const cal = new ICAL.Component(calData)
  const name = cal.getFirstProperty('x-wr-calname')?.getFirstValue() || ''
  const description =
    cal.getFirstProperty('x-wr-caldesc')?.getFirstValue() || ''

  const events: Partial<IEvent>[] = cal
    .getAllSubcomponents('vevent')
    .map((event) => {
      const summary = event.getFirstPropertyValue('summary') || 'No summary'
      const organizer = event.getFirstProperty('organizer') || 'No organizer'
      const eventDescription =
        event.getFirstPropertyValue('description') || 'No description'
      const attendees = event.getAllProperties('attendee') || []
      const starts = event
        .getFirstProperty('dtstart')
        .getFirstValue()
        .toString()
      const ends = event.getFirstProperty('dtend').getFirstValue().toString()
      const location = event.getFirstPropertyValue('location') || 'No location'

      const rrule = event.getFirstPropertyValue('rrule') as ICAL.Recur
      let rruleObj

      if (rrule) {
        const { byday, freq, until, ...icalRRuleJSON } = rrule.toJSON()

        const dayToRRuleMap: Record<string, Weekday> = {
          MO: RRule.MO,
          TU: RRule.TU,
          WE: RRule.WE,
          TH: RRule.TH,
          FR: RRule.FR,
          SA: RRule.SA,
          SU: RRule.SU,
        }

        const freqToRRuleMap: Record<string, Frequency> = {
          YEARLY: RRule.YEARLY,
          MONTHLY: RRule.MONTHLY,
          WEEKLY: RRule.WEEKLY,
          DAILY: RRule.DAILY,
          HOURLY: RRule.HOURLY,
          MINUTELY: RRule.MINUTELY,
          SECONDLY: RRule.SECONDLY,
        }

        const byweekday =
          typeof byday === 'string'
            ? [dayToRRuleMap[byday as string]]
            : (byday || []).map((day: string) => dayToRRuleMap[day])

        rruleObj = new RRule({
          ...icalRRuleJSON,
          freq: freqToRRuleMap[freq as string],
          ...(until && { until: new Date(until) }),
          byweekday,
        })
      }

      return {
        startTime:
          starts.indexOf('T') !== -1
            ? starts
            : dayjs(new Date(starts)).startOf('date'),
        endTime:
          ends.indexOf('T') !== -1
            ? ends
            : dayjs(new Date(ends)).subtract(1, 'days').endOf('date'),
        title: summary,
        description: eventDescription,
        ...(rruleObj && { rrule: rruleObj.options }),
      }
    })

  return {
    name,
    description,
    events,
  }
}

export default parseICal

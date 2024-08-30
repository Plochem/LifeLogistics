import { styled } from '@mui/material'
import dayjs from 'dayjs'
import { memo, useEffect, useState } from 'react'
import { Calendar as BigCalendar, dayjsLocalizer } from 'react-big-calendar'
import { RRule } from 'rrule'

import { DayOfWeek } from '@/types/enums'
import { isAllDay } from '@/utils/calendar/event'
import lightOrDark from '@/utils/lightOrDark'

import type { CSSProperties } from 'react'

const localizer = dayjsLocalizer(dayjs)

const StyledCalendar = styled(BigCalendar)(({ theme }) => ({
  '& .rbc-btn-group *': {
    color: theme.palette.text.primary,
    borderColor: theme.palette.mode === 'light' ? '#ddd' : '#4e5256',
  },
  '& .rbc-btn-group .rbc-active': {
    color: 'black',
  },
  '& .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row, .rbc-month-view, .rbc-header, .rbc-header + .rbc-header, .rbc-time-view, .rbc-time-header.rbc-overflowing, .rbc-time-header-content, .rbc-events-container, .rbc-timeslot-group, .rbc-day-slot .rbc-time-slot, .rbc-time-content':
    {
      borderColor: theme.palette.mode === 'light' ? '#ddd' : '#4e5256',
    },
  '& .rbc-today': {
    backgroundColor: theme.palette.mode === 'light' ? '#eaf6ff' : '#466075',
  },
  '& .rbc-off-range-bg': {
    backgroundColor: theme.palette.mode === 'light' ? '#e6e6e6' : '#262935',
  },
}))

type PropsType = {
  style: CSSProperties
  eventsAndColors: {
    event: IEvent
    color: string
  }[]
  // onEventClick: (e: IEvent) => void
  onEventClick: (e: IEvent, dateClicked: Date, dateClickedEnd: Date) => void
}

// big calendar does not have very good typing (simply infers 'object')
type CalendarEvent = {
  start: Date
  end: Date
  allDay: boolean
  title: string
  eventObj: IEvent
  color: string
}

const Calendar = ({ style, eventsAndColors, onEventClick }: PropsType) => {
  const [renderedEvents, setRenderedEvents] = useState<CalendarEvent[]>([])
  const [currDateViewing, setCurrDateViewing] = useState(dayjs())

  const styleEvent = (e: CalendarEvent): { style: React.CSSProperties } => ({
    style: {
      backgroundColor: e.color,
      color: lightOrDark(e.color) === 'light' ? 'black' : 'white',
    },
  })

  useEffect(() => {
    const newEvents: CalendarEvent[] = []
    eventsAndColors.forEach((ec) => {
      const e = ec.event
      const allDay = isAllDay(e)

      if (e.rrule) {
        // if has rrule, don't push current event since startTime is actually when it was created
        const rule = new RRule(e.rrule)
        rule
          .between(
            currDateViewing.startOf('month').subtract(1, 'week').toDate(),
            currDateViewing.endOf('month').add(1, 'week').toDate(),
            true
          )
          .forEach((er) => {
            newEvents.push({
              eventObj: e,
              title: e.title,
              allDay,
              start: er,
              end: allDay
                ? er
                : dayjs(er)
                    .add(dayjs(e.endTime).diff(e.startTime, 'minute'), 'minute')
                    .toDate(),
              color: ec.color,
            })
          })
      } else {
        newEvents.push({
          eventObj: e,
          title: e.title,
          allDay,
          start: e.startTime,
          end: e.endTime,
          color: ec.color,
        })
      }
    })
    setRenderedEvents(newEvents)
  }, [eventsAndColors, currDateViewing])

  return (
    <StyledCalendar
      localizer={localizer}
      style={style}
      events={renderedEvents}
      onSelectEvent={(e) => {
        onEventClick(
          (e as CalendarEvent).eventObj,
          (e as CalendarEvent).start,
          (e as CalendarEvent).end
        )
      }}
      eventPropGetter={(e) => styleEvent(e as CalendarEvent)}
      onNavigate={(d) => setCurrDateViewing(dayjs(d))}
    />
  )
}

export default memo(Calendar)

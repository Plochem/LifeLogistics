/* eslint-disable no-nested-ternary */
import { ArrowBack, CheckBox } from '@mui/icons-material'
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import to from 'await-to-js'
import axios from 'axios'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { RRule } from 'rrule'

import Calendar from '@/components/Calendar'
import DefaultLoadingView from '@/components/Loading/Default'
import Navbar from '@/components/Navbar'
import useAuth from '@/hooks/useAuth'
import {
  dateStringNoSec,
  isAllDay,
  populateDateObjs,
} from '@/utils/calendar/event'

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const MainCalendarView = () => {
  const { user } = useAuth()
  const router = useRouter()

  const [calendarsVisible, setCalendarsVisible] = useState<ICalendar[]>([])
  const [events, setEvents] = useState<IEvent[]>([])
  const [currEvent, setCurrEvent] = useState<IEvent | undefined>(undefined)
  const [currDate, setCurrDate] = useState<Date>(new Date())
  const [currDateEnd, setCurrDateEnd] = useState<Date>(new Date())

  const [eventsSet, setEventsSet] = useState<IEvent[]>([])

  // array of all calendars that contain events to display on calendar
  const allCalendars = useRef<ICalendar[]>([])

  useEffect(() => {
    if (user) {
      setCalendarsVisible([
        ...user.calendars,
        ...(user.followedCalendars || []),
      ])
    }
  }, [user])

  useEffect(() => {
    const updateVisibleEvents = async () => {
      // user's own calendars' events
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const _events = calendarsVisible.reduce(
        (prev, curr) =>
          prev.concat(curr.events.map((e) => populateDateObjs(e))),
        [] as IEvent[]
      )
      setEvents(_events)

      const invitedEvents = (user?.sharedEvents || []).map((e) =>
        populateDateObjs(e)
      ) as IEvent[]

      // create a set between events that user has been invited to, and their own events
      // user's invited events (does not include own events)
      const registeredEvents = invitedEvents.filter(
        (e) => !_events.find((_e) => _e._id === e._id)
      )
      const set = [..._events, ...registeredEvents] as IEvent[]

      allCalendars.current = calendarsVisible

      setEventsSet(set)

      if (!calendarsVisible.find((cal) => cal._id === currEvent?.calendar)) {
        setCurrEvent(undefined)
      }

      // fk it, dirty arse solution
      // problem: registered/invited events don't know what the title to their calendar is
      // solution: make reqs lmfao
      const [err, cals] = await to(
        Promise.all(
          registeredEvents.map(async (ev) => {
            const [err2, res] = await to(
              axios.get(`/api/calendar/${ev.calendar}`)
            )
            if (
              !err2 &&
              res &&
              res.status === 200 &&
              res.data &&
              res.data.calendar
            ) {
              return res.data.calendar
            }
            return undefined
          })
        )
      )

      if (!err && cals) {
        allCalendars.current = [
          ...allCalendars.current,
          ...(cals as ICalendar[]).filter((cal) => !!cal),
        ]
      }
    }
    updateVisibleEvents()
  }, [calendarsVisible])

  const mapEventToCalendar = (e: IEvent) =>
    allCalendars.current.find((cal) => cal._id === e.calendar)

  if (!user) return <DefaultLoadingView />

  return (
    <>
      <Navbar user={user} />
      <Box sx={{ mt: 10 }}>
        <IconButton sx={{ ml: 4, mb: 1 }} onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Grid container spacing={5} sx={{ mb: 5, px: 5 }}>
          <Grid item lg={4} xs={12}>
            <Box>
              <Paper
                variant="elevation"
                elevation={8}
                sx={{
                  p: { md: 3, xs: 2 },
                }}
              >
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Main Calendar
                </Typography>
                {user.calendars.length === 0 &&
                  !user.followedCalendars?.length && (
                    <Typography fontStyle="italic" color="text.secondary">
                      No calendars to display
                    </Typography>
                  )}
                <FormGroup>
                  {user.calendars.map((calendar) => (
                    <FormControlLabel
                      key={calendar._id}
                      control={
                        <Checkbox
                          checked={
                            !!calendarsVisible.find(
                              (c) => c._id === calendar._id
                            )
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCalendarsVisible((prev) => [...prev, calendar])
                            } else {
                              setCalendarsVisible((prev) =>
                                prev.filter((c) => c._id !== calendar._id)
                              )
                            }
                          }}
                          sx={{
                            color: calendar.color,
                            // filter: 'saturate(2)',
                            '&.Mui-checked': {
                              color: calendar.color,
                              // filter: 'saturate(2)',
                            },
                          }}
                        />
                      }
                      label={calendar.name}
                    />
                  ))}
                </FormGroup>
                {!!user.followedCalendars?.length && (
                  <FormGroup>
                    <Typography>Followed Calendars</Typography>
                    {user.followedCalendars.map((calendar) => (
                      <FormControlLabel
                        key={calendar._id}
                        control={
                          <Checkbox
                            checked={
                              !!calendarsVisible.find(
                                (c) => c._id === calendar._id
                              )
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCalendarsVisible((prev) => [
                                  ...prev,
                                  calendar,
                                ])
                              } else {
                                setCalendarsVisible((prev) =>
                                  prev.filter((c) => c._id !== calendar._id)
                                )
                              }
                            }}
                            sx={{
                              color: calendar.color,
                              '&.Mui-checked': {
                                color: calendar.color,
                              },
                            }}
                          />
                        }
                        label={calendar.name}
                      />
                    ))}
                  </FormGroup>
                )}
              </Paper>
              <Paper
                variant="elevation"
                elevation={8}
                sx={{
                  mt: 3,
                  p: { md: 3, xs: 2 },
                  border: 'solid',
                  borderWidth: 7,
                  borderColor: currEvent
                    ? mapEventToCalendar(currEvent)?.color ?? 'transparent'
                    : 'transparent',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={1}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h5" sx={{ mr: 'auto' }}>
                    Event Info
                  </Typography>
                </Stack>
                {currEvent ? (
                  <Stack direction="column">
                    <Typography variant="h6" lineHeight={1.1}>
                      {currEvent.title}
                    </Typography>
                    {mapEventToCalendar(currEvent) ? (
                      <Link
                        href={`/calendar/${currEvent.calendar}`}
                        style={{
                          textDecoration: 'none',
                        }}
                      >
                        <Typography
                          fontStyle="italic"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {mapEventToCalendar(currEvent)?.name}
                        </Typography>
                      </Link>
                    ) : (
                      <Typography
                        fontStyle="italic"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                        }}
                      >
                        Event from Private Calendar
                      </Typography>
                    )}
                    {currEvent.description ? (
                      <Typography>{currEvent.description}</Typography>
                    ) : (
                      <Typography fontStyle="italic" color="text.secondary">
                        No description
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Typography>
                        {isAllDay(currEvent) ? (
                          <>
                            <strong>Date:</strong>{' '}
                            {currDate.toLocaleDateString()}
                          </>
                        ) : (
                          <>
                            <strong>Start Time:</strong>{' '}
                            {dateStringNoSec(currDate)}
                          </>
                        )}
                      </Typography>
                      {isAllDay(currEvent) ? (
                        <Typography
                          fontStyle="italic"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          This is an all day event
                        </Typography>
                      ) : (
                        <Typography>
                          <strong>End Time:</strong>{' '}
                          {dateStringNoSec(currDateEnd)}
                        </Typography>
                      )}
                    </Box>
                    {currEvent.rrule && (
                      <Box sx={{ mt: 1 }}>
                        <Typography>
                          <b>Repeats Every:</b> {currEvent.rrule.interval}{' '}
                          {
                            {
                              3: 'day',
                              2: 'week',
                              1: 'month',
                              0: 'year',
                              4: '',
                              5: '',
                              6: '',
                            }[currEvent.rrule.freq]
                          }
                          {currEvent.rrule.interval > 1 ? 's' : ''}
                        </Typography>
                        {currEvent.rrule.freq === RRule.WEEKLY && (
                          <Typography>
                            <b>Days Repeated:</b>{' '}
                            {currEvent.rrule.byweekday
                              .map(
                                (dow) =>
                                  [
                                    'Mon',
                                    'Tues',
                                    'Weds',
                                    'Thurs',
                                    'Fri',
                                    'Sat',
                                    'Sun',
                                  ][dow]
                              )
                              .join(', ')}
                          </Typography>
                        )}
                        {currEvent.rrule.freq === RRule.MONTHLY && (
                          <Typography>
                            <b>Days Repeated:</b>{' '}
                            {currEvent.rrule.freq === RRule.MONTHLY &&
                            !currEvent.rrule.byweekday
                              ? `Every day ${dayjs(currEvent.startTime).date()}`
                              : `Every ${
                                  ['first', 'second', 'third', 'last'][
                                    Math.max(
                                      dayjs(currEvent.startTime).diff(
                                        dayjs(currEvent.startTime).startOf(
                                          'month'
                                        ),
                                        'week'
                                      ),
                                      1
                                    ) - 1
                                  ]
                                } ${
                                  DAYS_OF_WEEK[dayjs(currEvent.startTime).day()]
                                } of the month`}
                          </Typography>
                        )}
                        <Box sx={{ mt: 2 }}>
                          <Typography>
                            <strong>Started:</strong>{' '}
                            {currEvent.startTime.toLocaleDateString()}
                          </Typography>
                          <Typography>
                            <b>Ends:</b>{' '}
                            {currEvent.rrule.until
                              ? currEvent.rrule.until.toLocaleDateString()
                              : currEvent.rrule.count
                              ? `After ${currEvent.rrule.count} occurrences`
                              : 'Never'}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Typography color="text.secondary" fontStyle="italic">
                    No event selected
                  </Typography>
                )}
              </Paper>
            </Box>
          </Grid>
          <Grid item lg={8} xs={12}>
            <Paper
              variant="elevation"
              elevation={8}
              sx={{
                p: { md: 3, xs: 2 },
              }}
            >
              <Calendar
                style={{ height: '70vh' }}
                eventsAndColors={eventsSet.map((e) => ({
                  event: e,
                  color: mapEventToCalendar(e)?.color ?? '',
                }))}
                onEventClick={(e, d, de) => {
                  setCurrEvent(e)
                  setCurrDate(d)
                  setCurrDateEnd(de)
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default MainCalendarView

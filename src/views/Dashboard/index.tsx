import { AssignmentTurnedIn, Inbox, Upcoming } from '@mui/icons-material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import EventIcon from '@mui/icons-material/Event'
import InboxIcon from '@mui/icons-material/Inbox'
import {
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import to from 'await-to-js'
import axios from 'axios'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { mutate } from 'swr'

import EventCard from '@/components/EventCard'
import InvitationCard from '@/components/InvitationCard'
import DefaultLoadingView from '@/components/Loading/Default'
import Navbar from '@/components/Navbar'
import useAuth from '@/hooks/useAuth'
import { InviteStatus } from '@/types/enums'
import { populateDateObjs } from '@/utils/calendar/event'

const Dashboard = () => {
  const { status, user } = useAuth()
  const allCalendars = useRef<ICalendar[]>([])
  const [upcomingEventsWithDeadlines, setUpcomingEventsWithDeadlines] =
    useState<IEvent[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<IEvent[]>([])
  const [invitedEvents, setInvitedEvents] = useState<IEvent[]>([])

  useEffect(() => {
    if (user) {
      const getStuff = async () => {
        allCalendars.current = [
          ...user.calendars,
          ...user.followedCalendars.filter(
            (cal) => !user.calendars.find((cal2) => cal2._id === cal._id)
          ),
        ]
        const temp = [
          ...allCalendars.current,
          ...user.pinnedCalendars.filter(
            (cal) => !allCalendars.current.find((cal2) => cal2._id === cal._id)
          ),
        ]
        allCalendars.current = temp

        const allEvents = allCalendars.current.reduce(
          (prev, curr) =>
            prev.concat(curr.events.map((e) => populateDateObjs(e))),
          [] as IEvent[]
        )

        // get invited events
        const ie = user.eventInvites.sort((e1, e2) =>
          dayjs(e1.deadline).isBefore(e2.deadline) ? -1 : 1
        )

        // get all upcoming deadlines
        const ued = allEvents
          .concat(ie)
          .filter(
            (ev) =>
              !!ev.deadline &&
              !(ev.sharedUsers as ObjectId[]).find((uid) => user._id === uid) &&
              ev.owner !== user._id
          )
          .sort((e1, e2) => (dayjs(e1.deadline).isBefore(e2.deadline) ? -1 : 1))
        // get registered events
        const re = user.sharedEvents.sort((e1, e2) =>
          dayjs(e1.startTime).isBefore(e2.startTime) ? -1 : 1
        )

        setUpcomingEventsWithDeadlines(ued)
        setRegisteredEvents(re)
        setInvitedEvents(ie)

        // get calendar objs from these events
        const [err, cals] = await to(
          Promise.all(
            [...ued, ...re, ...ie].map(async (ev) => {
              const [err2, res] = await to(
                axios.get(`/api/calendar/${ev.calendar}`)
              )
              if (err2 || !res.data?.calendar) return null
              return res.data.calendar
            })
          )
        )
        if (!err && cals) {
          allCalendars.current = allCalendars.current.concat(
            cals.filter((cal) => !!cal)
          )
        }
      }
      getStuff()
    }
  }, [user])

  const mapEventToCalendar = (e: IEvent) =>
    allCalendars.current.find((cal) => cal._id === e.calendar)

  if (status === 'loading' || (status === 'authenticated' && !user) || !user)
    return <DefaultLoadingView />

  return (
    <>
      <Navbar user={user} />
      <Box sx={{ mt: 16, px: { md: 10, xs: 5 }, mb: 10 }}>
        <Typography variant="h5">
          Welcome back, <b>{user.name}</b>!
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
            <Inbox sx={{ mr: 2 }} />
            <Typography variant="h5">Invitations</Typography>
          </Stack>
          {user.invites.length === 0 && invitedEvents.length === 0 && (
            <Typography
              color="text.secondary"
              fontStyle="italic"
              sx={{ mb: 2 }}
            >
              No invitations
            </Typography>
          )}
          <Grid container spacing={2}>
            {[...(user.invites || []), ...invitedEvents].map((invite) =>
              Object.hasOwn(invite, 'name') ? (
                <Grid
                  item
                  lg={4}
                  sm={6}
                  xs={12}
                  key={(invite as ICalendar)._id}
                >
                  <InvitationCard calendar={invite as ICalendar} />
                </Grid>
              ) : (
                <Grid item lg={4} sm={6} xs={12} key={(invite as IEvent)._id}>
                  <InvitationCard
                    event={invite as IEvent}
                    calendar={mapEventToCalendar(invite as IEvent)}
                  />
                </Grid>
              )
            )}
          </Grid>
        </Box>
        <Divider sx={{ mt: 4, mb: 2 }} />
        <Box>
          <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
            <Upcoming sx={{ mr: 2 }} />
            <Typography variant="h5">
              Upcoming Registration Deadlines
            </Typography>
          </Stack>
          {upcomingEventsWithDeadlines.length === 0 && (
            <Typography
              color="text.secondary"
              fontStyle="italic"
              sx={{ mb: 2 }}
            >
              Nothing upcoming
            </Typography>
          )}
          <Grid container spacing={2}>
            {upcomingEventsWithDeadlines.map((ev) => (
              <Grid item lg={4} sm={6} xs={12} key={ev._id}>
                <EventCard event={ev} calendar={mapEventToCalendar(ev)} />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Divider sx={{ mt: 4, mb: 2 }} />
        <Box>
          <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
            <AssignmentTurnedIn sx={{ mr: 2 }} />
            <Typography variant="h5">Registered Events</Typography>
          </Stack>
          {upcomingEventsWithDeadlines.length === 0 && (
            <Typography
              color="text.secondary"
              fontStyle="italic"
              sx={{ mb: 2 }}
            >
              You have not registered to any events
            </Typography>
          )}
          <Grid container spacing={2}>
            {registeredEvents.map((ev) => (
              <Grid item lg={4} sm={6} xs={12} key={ev._id}>
                <EventCard
                  event={ev}
                  calendar={mapEventToCalendar(ev)}
                  registered
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  )
}

export default Dashboard

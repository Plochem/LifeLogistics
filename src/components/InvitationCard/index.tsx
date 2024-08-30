import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import EventIcon from '@mui/icons-material/Event'
import InboxIcon from '@mui/icons-material/Inbox'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  styled,
} from '@mui/material'
import to from 'await-to-js'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { mutate } from 'swr'

import { InviteStatus, Visibility } from '@/types/enums'
import { dateStringNoSec } from '@/utils/calendar/event'
import lightOrDark from '@/utils/lightOrDark'

type Props = {
  calendar?: ICalendar
  event?: IEvent
}

const OneLineTypography = styled(Typography)({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
})

const InvitationCard = ({ calendar, event }: Props) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onRespond = async (calendarId: string, inviteStatus: InviteStatus) => {
    setLoading(true)
    await to(
      axios.post(`/api/calendar/${calendarId}/invite/response`, {
        status: inviteStatus,
      })
    )
    await mutate('/api/user')
    setLoading(false)
  }

  const onRespondEvent = async (
    eventId: string,
    inviteStatus: InviteStatus
  ) => {
    setLoading(true)
    await to(
      axios.post(`/api/event/${eventId}/invite/response`, {
        status: inviteStatus,
      })
    )
    await mutate('/api/user')
    setLoading(false)
  }

  return (
    <>
      {calendar && !event && (
        <Card
          variant="elevation"
          elevation={4}
          sx={{
            height: '100%',
          }}
        >
          <CardActionArea
            href={
              calendar.visibility === Visibility.PUBLIC
                ? `/calendar/${calendar._id as string}`
                : ''
            }
            onClick={(e) => {
              e.preventDefault()
              if (calendar.visibility === Visibility.PUBLIC) {
                router.push(`/calendar/${calendar._id as string}`)
              }
            }}
            sx={{ height: '100%' }}
          >
            <CardContent sx={{ height: '100%' }}>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ height: '100%' }}
              >
                <Box sx={{ width: '90%' }}>
                  <Stack direction="row" alignItems="center">
                    <CalendarMonthIcon sx={{ mr: 1, color: '#0000008a' }} />
                    <OneLineTypography variant="h6">
                      {calendar.name}
                    </OneLineTypography>
                  </Stack>
                  <Typography
                    variant="caption"
                    fontStyle="italic"
                    color="text.secondary"
                  >
                    Group Calendar
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Accept">
                    <IconButton
                      size="small"
                      sx={{ color: '#07bc0c' }}
                      onClick={() =>
                        onRespond(calendar._id, InviteStatus.ACCEPTED)
                      }
                      disabled={loading}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Decline">
                    <IconButton
                      size="small"
                      sx={{ color: '#e74c3c' }}
                      onClick={() =>
                        onRespond(calendar._id, InviteStatus.DECLINED)
                      }
                      disabled={loading}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      )}
      {event && (
        <Card
          variant="elevation"
          elevation={4}
          sx={{
            height: '100%',
          }}
        >
          <CardActionArea
            href={calendar ? `/calendar/${event.calendar as string}` : ''}
            onClick={(e) => {
              e.preventDefault()
              if (calendar) {
                router.push(`/calendar/${event.calendar as string}`)
              }
            }}
            sx={{ height: '100%' }}
          >
            <CardContent sx={{ height: '100%' }}>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ height: '100%' }}
              >
                <Box sx={{ width: '90%' }}>
                  <Stack direction="row" alignItems="center">
                    <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <OneLineTypography variant="h6">
                      {event.title}
                    </OneLineTypography>
                  </Stack>
                  <Typography
                    variant="caption"
                    fontStyle="italic"
                    color="text.secondary"
                  >
                    Event from{' '}
                    {calendar ? `"${calendar.name}"` : 'Private Calendar'}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <b>Date:</b> {dateStringNoSec(new Date(event.startTime))}
                  </Typography>
                  {event.deadline && (
                    <Typography>
                      <b>Deadline:</b>{' '}
                      {dateStringNoSec(new Date(event.deadline))}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Accept">
                    <IconButton
                      size="small"
                      sx={{ color: '#07bc0c' }}
                      onClick={() =>
                        onRespondEvent(event._id, InviteStatus.ACCEPTED)
                      }
                      disabled={loading}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Decline">
                    <IconButton
                      size="small"
                      sx={{ color: '#e74c3c' }}
                      onClick={() =>
                        onRespondEvent(event._id, InviteStatus.DECLINED)
                      }
                      disabled={loading}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      )}
    </>
  )
}

export default InvitationCard

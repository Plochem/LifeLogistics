import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import EventIcon from '@mui/icons-material/Event'
import InboxIcon from '@mui/icons-material/Inbox'
import {
  Badge,
  Box,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import to from 'await-to-js'
import axios from 'axios'
import { useMemo, useState } from 'react'
import { mutate } from 'swr'

import { InviteStatus } from '@/types/enums'

type Props = {
  user: IUser
}

const InboxPopover = ({ user }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [loading, setLoading] = useState(false)

  const open = Boolean(anchorEl)

  const onRespond = async (calendarId: string, status: InviteStatus) => {
    setLoading(true)

    await to(
      axios.post(`/api/calendar/${calendarId}/invite/response`, {
        status,
      })
    )

    await mutate('/api/user')

    setLoading(false)
  }

  const onRespondEvent = async (eventId: string, status: InviteStatus) => {
    setLoading(true)

    await to(
      axios.post(`/api/event/${eventId}/invite/response`, {
        status,
      })
    )

    await mutate('/api/user')

    setLoading(false)
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const invites = useMemo(
    () => [...(user.invites || []), ...(user.eventInvites || [])],
    [user]
  )

  const generateCalendarInvite = (calendar: ICalendar) => (
    <Stack
      key={calendar._id}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        border: '2px solid #949494',
        borderRadius: 2,
        py: 0.5,
        px: 1,
        my: 0.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title="Calendar Invitation">
          <CalendarMonthIcon sx={{ color: 'text.secondary' }} />
        </Tooltip>

        <Typography
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
          }}
        >
          {calendar.name}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Accept">
          <IconButton
            size="small"
            sx={{ color: '#07bc0c' }}
            onClick={() => onRespond(calendar._id, InviteStatus.ACCEPTED)}
            disabled={loading}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Decline">
          <IconButton
            size="small"
            sx={{ color: '#e74c3c' }}
            onClick={() => onRespond(calendar._id, InviteStatus.DECLINED)}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  )

  const generateEventInvite = (event: IEvent) => (
    <Stack
      key={event._id}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        border: '2px solid #949494',
        borderRadius: 2,
        py: 0.5,
        px: 1,
        my: 0.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title="Event Invitation">
          <EventIcon sx={{ color: 'text.secondary' }} />
        </Tooltip>

        <Typography
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
          }}
        >
          {event.title}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Accept">
          <IconButton
            size="small"
            sx={{ color: '#07bc0c' }}
            onClick={() => onRespondEvent(event._id, InviteStatus.ACCEPTED)}
            disabled={loading}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Decline">
          <IconButton
            size="small"
            sx={{ color: '#e74c3c' }}
            onClick={() => onRespondEvent(event._id, InviteStatus.DECLINED)}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  )

  return (
    <>
      <Tooltip title="Inbox">
        <IconButton onClick={handleClick}>
          <Badge
            color="secondary"
            variant="dot"
            invisible={invites.length === 0}
          >
            <InboxIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Invites
          </Typography>

          {invites.length === 0 && (
            <Typography fontStyle="italic" color="text.secondary">
              No pending invites
            </Typography>
          )}

          {invites.map((invite) =>
            Object.hasOwn(invite, 'name')
              ? generateCalendarInvite(invite as ICalendar)
              : generateEventInvite(invite as IEvent)
          )}
        </Box>
      </Popover>
    </>
  )
}

export default InboxPopover

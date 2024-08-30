import { Group } from '@mui/icons-material'
import ArrowForward from '@mui/icons-material/ArrowForward'
import PushPinIcon from '@mui/icons-material/PushPin'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { styled } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import to from 'await-to-js'
import axios from 'axios'
import router from 'next/router'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'

import TOAST_CONFIG from '@/constants/toastconfig'
import useAuth from '@/hooks/useAuth'
import { CalendarType, Visibility } from '@/types/enums'
import lightOrDark from '@/utils/lightOrDark'

import type { MouseEvent } from 'react'

const OneLineTypography = styled(Typography)({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
})

const PushPin = styled(PushPinIcon)({
  transition: 'transform 250ms ease, opacity 250ms ease',

  '&:hover': {
    cursor: 'pointer',
    transform: 'scale(0.92)',
    opacity: 0.7,
  },
})

type Props = {
  calendar: ICalendar | IGroupCalendar
}

const CalendarCard = ({ calendar }: Props) => {
  const { mutate } = useSWRConfig()

  const { user } = useAuth()

  const isPinned = useMemo(
    () => (user?.pinnedCalendars || []).some(({ _id }) => _id === calendar._id),
    [user, calendar]
  )

  // allow for immediate feedback of unpinning
  const [togglingPin, setTogglingPin] = useState(false)

  const togglePinCalendar = async (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setTogglingPin(true)

    toast.success(
      `Calendar ${isPinned ? 'unpinned!' : 'pinned!'}`,
      TOAST_CONFIG
    )

    await to(
      axios.post(`/api/calendar/${calendar._id}/pin`, {
        pinStatus: !isPinned,
      })
    )

    await mutate('/api/user')

    setTogglingPin(false)
  }

  return (
    <Card
      key={calendar._id}
      variant="elevation"
      elevation={8}
      sx={{
        backgroundColor: calendar.color,
      }}
    >
      <CardActionArea
        href={`/calendar/${calendar._id as string}`}
        onClick={(e) => {
          e.preventDefault()
          router.push(`/calendar/${calendar._id as string}`)
        }}
      >
        <CardContent
          sx={{
            color: lightOrDark(calendar.color) === 'light' ? 'black' : 'white',
          }}
        >
          <Stack direction="row" alignItems="center">
            <Box sx={{ width: '90%' }}>
              <Stack direction="row" alignItems="center">
                {isPinned && !togglingPin && (
                  <Stack pr={1}>
                    <PushPin
                      titleAccess={`${isPinned ? 'Unpin' : 'Pin'} calendar?`}
                      onClick={togglePinCalendar}
                    />
                  </Stack>
                )}
                {/* Before, we don't render these visibility icons unless you're the owner. 
                  but since we're allowing sharing of calendars, others should see the visibility of the calendars since they co-owners.
                  So it'll be hard to distinguish between random viewers vs shared users, so might as well just display them
               */}
                {calendar.visibility === Visibility.PUBLIC ? (
                  <VisibilityIcon
                    sx={{ mr: 1 }}
                    titleAccess="Public calendar"
                  />
                ) : (
                  <VisibilityOffIcon
                    sx={{ mr: 1 }}
                    titleAccess="Private calendar"
                  />
                )}
                {calendar.type === CalendarType.GROUP && (
                  <Group sx={{ mr: 1 }} titleAccess="Group Calendar" />
                )}
                <OneLineTypography variant="h6">
                  {calendar.name}
                </OneLineTypography>
              </Stack>
              {!calendar.description ? (
                <Typography fontStyle="italic" variant="body2">
                  No description
                </Typography>
              ) : (
                <OneLineTypography variant="body2">
                  {calendar.description}
                </OneLineTypography>
              )}
            </Box>
            <ArrowForward sx={{ ml: 'auto' }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default CalendarCard

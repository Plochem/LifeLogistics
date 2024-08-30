import { ArrowForward } from '@mui/icons-material'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  styled,
} from '@mui/material'
import { useRouter } from 'next/router'

import { dateStringNoSec } from '@/utils/calendar/event'

type Props = {
  event: IEvent
  // calendar obj associated with event
  calendar?: ICalendar
  registered?: boolean
}

const OneLineTypography = styled(Typography)({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
})

const EventCard = ({ event, calendar, registered }: Props) => {
  const router = useRouter()

  return (
    <Card variant="elevation" elevation={4}>
      <CardActionArea
        href={calendar ? `/calendar/${event.calendar as string}` : ''}
        onClick={(e) => {
          e.preventDefault()
          if (calendar) {
            router.push(`/calendar/${event.calendar as string}`)
          }
        }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center">
            <Box sx={{ width: '90%' }}>
              <Stack direction="row" alignItems="center">
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
              {event.deadline && !registered && (
                <Typography>
                  <b>Deadline:</b> {dateStringNoSec(new Date(event.deadline))}
                </Typography>
              )}
            </Box>
            <ArrowForward sx={{ ml: 'auto' }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default EventCard

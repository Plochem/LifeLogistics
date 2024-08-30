/* eslint-disable no-nested-ternary */
import {
  Add,
  ArrowBack,
  Check,
  Delete,
  Edit,
  FileDownload,
  Group,
  PersonAdd,
  VisibilityOff,
  Visibility as VisibilityOn,
} from '@mui/icons-material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PushPinIcon from '@mui/icons-material/PushPin'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  styled,
  useTheme,
} from '@mui/material'
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers'
import to from 'await-to-js'
import axios from 'axios'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { TwitterPicker } from 'react-color'
import { toast } from 'react-toastify'
import { Frequency, RRule } from 'rrule'
import { mutate } from 'swr'

import Calendar from '@/components/Calendar'
import CalendarTags from '@/components/CalendarTags'
import CalendarShareDialog from '@/components/Dialog/CalendarShare'
import ConfirmDialog from '@/components/Dialog/Confirm'
import EventShare from '@/components/EventShare'
import DefaultLoadingView from '@/components/Loading/Default'
import Navbar from '@/components/Navbar'
import DEFAULT_PALETTE from '@/constants/palette'
import TOAST_CONFIG from '@/constants/toastconfig'
import useAuth from '@/hooks/useAuth'
import { CalendarType, GroupCalendarRole, Visibility } from '@/types/enums'
import {
  dateStringNoSec,
  isAllDay,
  populateDateObjs,
  sundayWeekToMonday,
} from '@/utils/calendar/event'
import exportCalendar from '@/utils/calendar/export'
import { verifyPermissions } from '@/utils/calendar/role'

import type { Dayjs } from 'dayjs'

const PushPin = styled(PushPinIcon)({
  transition: 'transform 250ms ease, opacity 250ms ease',

  '&:hover': {
    cursor: 'pointer',
    transform: 'scale(0.92)',
    opacity: 0.7,
  },
})

const Bookmark = styled(BookmarkIcon)({
  transition: 'transform 250ms ease, opacity 250ms ease',

  '&:hover': {
    cursor: 'pointer',
    transform: 'scale(0.92)',
    opacity: 0.7,
  },
})

enum MonthlyOption {
  MONTHLY_DAY = 0,
  MONTHLY_WEEKDAY = 1,
}

enum EventRepeatOption {
  NEVER = 0,
  UNTIL = 1,
  OCCURS = 2,
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const CalendarView = () => {
  const { user } = useAuth(true)
  const router = useRouter()
  const theme = useTheme()
  const calendarId = router.query.id as string

  // TODO find user's role

  const [loading, setLoading] = useState(true)
  const [calendar, setCalendar] = useState<
    ICalendar | IGroupCalendar | undefined
  >()
  const [events, setEvents] = useState<IEvent[]>([])
  const [currEvent, setCurrEvent] = useState<IEvent | undefined>(undefined)
  const [currDate, setCurrDate] = useState<Date>(new Date())
  const [currDateEnd, setCurrDateEnd] = useState<Date>(new Date())

  const [isEditing, setIsEditing] = useState(false)
  const [editCalName, setEditCalName] = useState('')
  const [editCalDesc, setEditCalDesc] = useState('')
  const [editCalIsPublic, setEditCalIsPublic] = useState(false)
  const [editCalIsGroup, setEditCalIsGroup] = useState(CalendarType.CALENDAR)
  const [editCalColor, setEditCalColor] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])

  const [showSharePopup, setShowSharePopup] = useState(false)

  const [isSavingCal, setIsSavingCal] = useState(false)
  const [confirmDeleteCal, setConfirmDeleteCal] = useState(false)
  const [isDeletingCal, setIsDeletingCal] = useState(false)

  const [hasDeadline, setHasDeadline] = useState(false)
  const [deadlineDate, setDeadlineDate] = useState<Dayjs | null>(
    dayjs(new Date())
  )
  // should prob move event logic to a separate component, but eh
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [editEventTitle, setEditEventTitle] = useState('')
  const [editEventDesc, setEditEventDesc] = useState('')
  const [editEventReminder, setEditEventReminder] = useState(0)
  const [editEventStart, setEditEventStart] = useState<Dayjs>(
    dayjs(new Date()).startOf('date')
  )
  const [editEventAllDay, setEditEventAllDay] = useState(true)
  const [editEventEnd, setEditEventEnd] = useState<Dayjs>(
    dayjs(new Date()).endOf('date')
  )

  const [editEventRepeats, setEditEventRepeats] = useState(false)
  // how does it end
  const [editEventRepeatEnd, setEditEventRepeatEnd] =
    useState<EventRepeatOption>(EventRepeatOption.OCCURS)
  // repeat every weeks/days/months
  const [editEventFreqUnit, setEditEventFreqUnit] = useState<Frequency>(
    RRule.WEEKLY
  )
  // repeat for every x freqUnits (e.g. every 2 weeks)
  const [editEventInterval, setEditEventInterval] = useState(1)
  // if repeat end = occur, repeat for x times
  const [editEventRecurrences, setEditEventRecurrences] = useState(1)
  // if repeat weekly, which days to repeat on
  const [editEventDow, setEditEventDow] = useState<number[]>([])
  // if repeat ends = until, which date to end until
  const [editEventRecUntil, setEditEventRecUntil] = useState<Dayjs | undefined>(
    undefined
  )
  // if repeat monthly, how should repeat? repeat on x day, or repeate on weekday every month
  const [editEventRecMonth, setEditEventRecMonth] = useState<MonthlyOption>(
    MonthlyOption.MONTHLY_DAY
  )

  // stores invites of current event
  const [eventInvites, setEventInvites] = useState<string[]>([])

  const [isEditingEvent, setIsEditingEvent] = useState(false)

  const [isSavingEvent, setIsSavingEvent] = useState(false)
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(false)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)

  // #region calendar funcs

  const isPinned = useMemo(
    () => (user?.pinnedCalendars || []).some(({ _id }) => _id === calendarId),
    [user, calendarId]
  )

  const isFollowing = useMemo(
    () => (user?.followedCalendars || []).some(({ _id }) => _id === calendarId),
    [user, calendarId]
  )

  // allow pinning only if current user is owner
  // or if this is a public calendar that the current user followed already
  const canPin = useMemo(
    () => user?._id === calendar?.owner || isFollowing,
    [isFollowing, user, calendar]
  )

  const hydrateCalendar = async () => {
    const res = await axios
      .get(`/api/calendar/${calendarId}`)
      .catch((e) => ({ status: e.response.status, data: undefined }))
    if (res.status !== 200 || !res.data || !res.data.calendar) {
      router.push('/404')
    } else {
      setCalendar(res.data.calendar)
      setEvents(
        res.data.calendar.events.map((e: IEvent) => populateDateObjs(e))
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user && calendarId) {
      hydrateCalendar()
    }
  }, [router, user])

  const handleEdit = () => {
    if (isEditing) setIsEditing(false)
    else if (calendar) {
      const { name, description, visibility, color, tags, type } = calendar
      setEditCalName(name)
      setEditCalDesc(description)
      setEditCalIsPublic(visibility === Visibility.PUBLIC)
      setEditCalIsGroup(type ?? CalendarType.CALENDAR)
      setEditCalColor(color)
      setEditTags(tags)
      setIsEditing(true)
    }
  }

  const handleSaveCal = async () => {
    setIsSavingCal(true)
    const res = await axios
      .patch(`/api/calendar/${calendarId}`, {
        payload: {
          name: editCalName,
          description: editCalDesc,
          color: editCalColor,
          visibility: editCalIsPublic ? Visibility.PUBLIC : Visibility.PRIVATE,
          tags: editTags,
          type: editCalIsGroup,
        },
      })
      .catch((e) => ({ status: e.response.status, data: undefined }))
    if (res.status !== 200 || !res.data || !res.data.calendar) {
      toast.error(
        'There was an error editing your calendar! Please try again later',
        TOAST_CONFIG
      )
    } else {
      setCalendar(res.data.calendar)
      toast.success('Successfully updated calendar!', TOAST_CONFIG)
      setIsEditing(false)
    }
    setIsSavingCal(false)
  }

  const handleCancelCal = () => {
    setIsEditing(false)
    setIsSavingCal(false)
  }

  const handleDeleteCal = () => {
    setConfirmDeleteCal(true)
  }

  const handleConfirmDeleteCal = async () => {
    if (isDeletingCal) return
    setConfirmDeleteCal(false)
    setIsDeletingCal(true)
    const res = await axios
      .delete(`/api/calendar/${calendarId}`)
      .catch((e) => ({ status: e.response.status, data: undefined }))
    if (res.status !== 200 || !res.data || !res.data.calendar) {
      toast.error(
        'There was an error deleting your calendar! Please try again later',
        TOAST_CONFIG
      )
      setIsDeletingCal(false)
    } else {
      toast.success('Successfully deleted calendar!', TOAST_CONFIG)
      router.push('/user')
    }
  }

  const togglePinCal = async () => {
    await to(
      axios.post(`/api/calendar/${calendarId}/pin`, {
        pinStatus: !isPinned,
      })
    )

    toast.success(
      `Calendar ${isPinned ? 'unpinned!' : 'pinned!'}`,
      TOAST_CONFIG
    )

    await mutate('/api/user')
  }

  const toggleFollowCal = async () => {
    await to(
      axios.post(`/api/calendar/${calendarId}/follow`, {
        unfollow: isFollowing,
      })
    )

    toast.success(
      `Calendar ${isFollowing ? 'unfollowed!' : 'followed!'}`,
      TOAST_CONFIG
    )

    await mutate('/api/user')
  }

  const handleShare = () => {
    setShowSharePopup(true)
  }

  const handleCloseShare = () => {
    setShowSharePopup(false)
  }

  // #endregion calendar funcs

  // #region event funcs

  const handleEditEvent = () => {
    if (isEditingEvent || !currEvent) setIsEditingEvent(false)
    else {
      const {
        title,
        description,
        startTime,
        endTime,
        reminder,
        deadline,
        rrule,
      } = currEvent
      setEditEventTitle(title)
      setEditEventDesc(description)
      setEditEventStart(dayjs(startTime))
      setEditEventEnd(dayjs(endTime))
      setEditEventAllDay(isAllDay(currEvent))
      setEditEventReminder(reminder)
      setEditEventRepeats(!!rrule)
      setHasDeadline(!!deadline)
      setDeadlineDate(deadline ? dayjs(deadline) : null)

      if (rrule) {
        setEditEventRepeatEnd(
          rrule.until
            ? EventRepeatOption.UNTIL
            : rrule.count
            ? EventRepeatOption.OCCURS
            : EventRepeatOption.NEVER
        )
        setEditEventFreqUnit(rrule.freq)
        setEditEventInterval(rrule.interval)
        setEditEventRecurrences(rrule.count ?? 0)
        setEditEventDow(rrule.byweekday ?? [])
        setEditEventRecUntil(rrule.until ? dayjs(rrule.until) : undefined)
        setEditEventRecMonth(
          rrule.freq === RRule.MONTHLY && !!rrule.byweekday
            ? MonthlyOption.MONTHLY_WEEKDAY
            : MonthlyOption.MONTHLY_DAY
        )
      }
      setIsEditingEvent(true)
    }
  }

  const checkEventFields = () =>
    !!editEventTitle &&
    editEventStart.isBefore(editEventEnd) &&
    (!editEventRepeats ||
      (editEventRepeats &&
        (editEventFreqUnit !== RRule.WEEKLY ||
          (editEventFreqUnit === RRule.WEEKLY && editEventDow.length > 0)) &&
        (editEventFreqUnit !== RRule.MONTHLY ||
          editEventRepeatEnd !== EventRepeatOption.UNTIL ||
          (editEventFreqUnit === RRule.MONTHLY &&
            editEventRepeatEnd === EventRepeatOption.UNTIL &&
            editEventRecUntil?.isAfter(editEventStart))))) &&
    (!hasDeadline || (hasDeadline && deadlineDate !== null))

  const createRRule = () =>
    editEventRepeats
      ? new RRule({
          wkst: RRule.SU,
          freq: editEventFreqUnit,
          interval: editEventInterval,
          dtstart: editEventStart.toDate(),
          byweekday:
            editEventFreqUnit === Frequency.WEEKLY
              ? editEventDow
              : editEventFreqUnit === Frequency.MONTHLY &&
                editEventRecMonth === MonthlyOption.MONTHLY_WEEKDAY
              ? sundayWeekToMonday(editEventStart.day())
              : undefined,
          until:
            editEventRepeatEnd === EventRepeatOption.UNTIL && editEventRecUntil
              ? editEventRecUntil.toDate()
              : undefined,
          count:
            editEventRepeatEnd === EventRepeatOption.OCCURS
              ? editEventRecurrences
              : undefined,
          bysetpos:
            editEventFreqUnit === Frequency.MONTHLY &&
            editEventRecMonth === MonthlyOption.MONTHLY_WEEKDAY
              ? Math.max(
                  editEventStart.diff(editEventStart.startOf('month'), 'week'),
                  1
                )
              : undefined,
        }).options
      : null

  const handleCreateEvent = async () => {
    setIsSavingEvent(true)
    const res = await axios
      .post('/api/event', {
        payload: {
          calendar: calendarId,
          title: editEventTitle,
          description: editEventDesc,
          startTime: editEventStart.toDate(),
          endTime: editEventEnd.toDate(),
          reminder: editEventReminder,
          deadline: hasDeadline && deadlineDate ? deadlineDate.toDate() : null,
          rrule: createRRule(),
        },
      })
      .catch((e) => ({ status: e.response.status, data: undefined }))
    if (res.status !== 200 || !res.data || !res.data.Event) {
      toast.error(
        'There was an error creating event! Please try again later',
        TOAST_CONFIG
      )
    } else {
      const ev = populateDateObjs(res.data.Event)
      setEvents((prev) => [...prev, ev])
      setCurrEvent(ev)
      setEditEventTitle('')
      setEditEventDesc('')
      setEditEventStart(dayjs(new Date()).startOf('date'))
      setEditEventEnd(dayjs(new Date()).endOf('date'))
      setEditEventRepeats(false)
      setEditEventDow([])
      toast.success('Successfully created event!', TOAST_CONFIG)
      setIsCreatingEvent(false)
    }

    await hydrateCalendar()

    setIsSavingEvent(false)
  }

  const handleSaveEvent = async () => {
    if (!currEvent) return
    setIsSavingEvent(true)
    const res = await axios
      .patch(`/api/event/${currEvent._id}`, {
        payload: {
          calendar: calendarId,
          title: editEventTitle,
          description: editEventDesc,
          startTime: editEventStart.toDate(),
          endTime: editEventEnd.toDate(),
          reminder: editEventReminder,
          deadline: hasDeadline && deadlineDate ? deadlineDate.toDate() : null,
          rrule: createRRule(),
        },
      })
      .catch((e) => ({ status: e.response.status, data: undefined }))

    if (res.status !== 200 || !res.data || !res.data.event) {
      toast.error(
        'There was an error saving changes to event! Please try again later',
        TOAST_CONFIG
      )
    } else {
      const ev = populateDateObjs(res.data.event)
      setEvents((prev) => [...prev, ev])
      setCurrEvent(ev)
      setEvents((prev) => [...prev.filter((e) => e._id !== ev._id), ev])
      setEditEventTitle('')
      setEditEventDesc('')
      setEditEventStart(dayjs(new Date()).startOf('date'))
      setEditEventEnd(dayjs(new Date()).endOf('date'))
      setEditEventRepeats(false)
      setEditEventDow([])
      toast.success('Successfully saved event!', TOAST_CONFIG)
      setIsEditingEvent(false)
    }

    await hydrateCalendar()

    setIsSavingEvent(false)
  }

  const handleCancelCreateEditEvent = () => {
    setIsCreatingEvent(false)
    setIsEditingEvent(false)
    setIsSavingEvent(false)
  }

  const handleDeleteEvent = () => {
    if (!currEvent) return
    setConfirmDeleteEvent(true)
  }

  const handleConfirmDeleteEvent = async () => {
    if (!currEvent) return
    setConfirmDeleteEvent(false)
    setIsDeletingEvent(true)
    const res = await axios
      .delete(`/api/event/${currEvent._id}`)
      .catch((e) => ({ status: e.response.status, data: undefined }))
    if (res.status !== 200 || !res.data || !res.data.event) {
      toast.error(
        'There was an error deleting event! Please try again later',
        TOAST_CONFIG
      )
    } else {
      const eventId = currEvent._id
      setEvents((prev) => prev.filter((e) => e._id !== eventId))
      setCurrEvent(undefined)
      setIsEditingEvent(false)
      toast.success('Successfully deleted event!', TOAST_CONFIG)
      setEditEventTitle('')
      setEditEventDesc('')
      setEditEventStart(dayjs(new Date()).startOf('date'))
      setEditEventEnd(dayjs(new Date()).endOf('date'))
      setEditEventRepeats(false)
      setEditEventDow([])
    }

    await hydrateCalendar()

    setIsDeletingEvent(false)
  }

  const eventsAndColors = useMemo(
    () =>
      events.map((e) => ({
        event: e,
        color: calendar?.color || DEFAULT_PALETTE[0],
      })),
    [events, calendar]
  )

  // #endregion event funcs

  const exportCal = () => {
    if (calendar) exportCalendar(calendar)
  }

  if (!user || loading || !calendar) return <DefaultLoadingView />

  return (
    <>
      <Navbar user={user} />
      <Box sx={{ mt: 10 }}>
        <IconButton sx={{ ml: 4, mb: 1 }} onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Grid container spacing={5} sx={{ mb: 5, px: 5 }}>
          <Grid item lg={4} xs={12}>
            <Stack direction="column">
              <Paper
                variant="elevation"
                elevation={8}
                sx={{
                  p: { md: 3, xs: 2 },
                }}
              >
                {!isEditing ? (
                  <>
                    <Stack
                      direction="row"
                      alignItems="center"
                      flexWrap="wrap"
                      sx={{ mb: 2 }}
                      gap={1}
                    >
                      {canPin && (
                        <Tooltip
                          title={`${isPinned ? 'Unpin' : 'Pin'} calendar?`}
                        >
                          <PushPin
                            sx={{ opacity: isPinned ? 1 : 0.3 }}
                            onClick={togglePinCal}
                          />
                        </Tooltip>
                      )}
                      {calendar.owner !== user.id && (
                        <Tooltip title={isFollowing ? 'Unfollow?' : 'Follow?'}>
                          <Bookmark
                            sx={{ opacity: isFollowing ? 1 : 0.3 }}
                            onClick={toggleFollowCal}
                          />
                        </Tooltip>
                      )}

                      {calendar.type === CalendarType.GROUP && (
                        <Tooltip title="Group Calendar">
                          <Group />
                        </Tooltip>
                      )}

                      {calendar.visibility === Visibility.PUBLIC ? (
                        <Tooltip title="Public calendar">
                          <VisibilityOn />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Private calendar">
                          <VisibilityOff />
                        </Tooltip>
                      )}

                      <Typography variant="h5" sx={{ mr: 'auto' }}>
                        {calendar.name}
                      </Typography>

                      {(calendar.owner === user.id ||
                        (calendar.type === CalendarType.GROUP &&
                          verifyPermissions(
                            user.id,
                            calendar as IGroupCalendar,
                            [GroupCalendarRole.ADMIN]
                          ))) && (
                        <Stack direction="row" gap={1}>
                          <Button
                            variant="outlined"
                            endIcon={<Edit />}
                            onClick={handleEdit}
                          >
                            Edit
                          </Button>
                          {calendar.type === CalendarType.GROUP && (
                            <Button
                              variant="outlined"
                              endIcon={<PersonAdd />}
                              onClick={handleShare}
                            >
                              Share
                            </Button>
                          )}
                        </Stack>
                      )}
                    </Stack>
                    {calendar.description ? (
                      <Typography>{calendar.description}</Typography>
                    ) : (
                      <Typography fontStyle="italic" color="text.secondary">
                        No description
                      </Typography>
                    )}
                    <Stack direction="row" gap={1} sx={{ mt: 2 }}>
                      {calendar.tags.map((t) => (
                        <Chip key={t} label={t} size="small" />
                      ))}
                    </Stack>

                    <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        endIcon={<FileDownloadIcon />}
                        onClick={exportCal}
                      >
                        Export
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <TextField
                      label="Name"
                      value={editCalName}
                      required
                      fullWidth
                      margin="normal"
                      onChange={(e) => setEditCalName(e.target.value)}
                      placeholder="Put an exquisite calendar name"
                    />
                    <TextField
                      margin="normal"
                      label="Description"
                      value={editCalDesc}
                      fullWidth
                      multiline
                      minRows={3}
                      onChange={(e) => setEditCalDesc(e.target.value)}
                      placeholder="Add a lil' description"
                    />
                    <Stack direction="row" alignItems="center">
                      <Typography>Public Calendar:</Typography>
                      <Switch
                        checked={editCalIsPublic}
                        onChange={(e) => setEditCalIsPublic(e.target.checked)}
                      />
                    </Stack>
                    {calendar.owner === user._id && (
                      <Stack direction="row" alignItems="center">
                        <Typography>Group Calendar:</Typography>
                        <Switch
                          checked={editCalIsGroup === CalendarType.GROUP}
                          onChange={(e) =>
                            setEditCalIsGroup(
                              e.target.checked
                                ? CalendarType.GROUP
                                : CalendarType.CALENDAR
                            )
                          }
                        />
                      </Stack>
                    )}
                    <CalendarTags setTags={setEditTags} tags={editTags} />
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{ mb: 1, mt: 2 }}
                      >
                        <Typography>Event color: </Typography>
                        <Box
                          sx={{
                            border: 'solid',
                            borderWidth: '0.5px',
                            borderColor: '#ABB8C3',
                            backgroundColor: editCalColor,
                            width: '2em',
                            height: '1em',
                            ml: 1,
                          }}
                        />
                      </Stack>
                      <TwitterPicker
                        triangle="hide"
                        width="100%"
                        color={editCalColor}
                        onChange={(c) => setEditCalColor(c.hex)}
                        colors={DEFAULT_PALETTE}
                        styles={{
                          default: {
                            card: {
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? 'white'
                                  : '#2a2a2a',
                            },
                            input: {
                              color: theme.palette.text.primary,
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? 'white'
                                  : '#2a2a2a',
                            },
                          },
                        }}
                      />
                    </Box>

                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      sx={{ mt: 3 }}
                    >
                      {user.id === calendar.owner && (
                        <LoadingButton
                          // variant="contained"
                          variant="outlined"
                          color="error"
                          endIcon={<Delete />}
                          sx={{ mr: 'auto' }}
                          disabled={isSavingCal || isDeletingCal}
                          loading={isDeletingCal}
                          onClick={handleDeleteCal}
                        >
                          Delete
                        </LoadingButton>
                      )}
                      <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleCancelCal}
                          disabled={isSavingCal || isDeletingCal}
                        >
                          Cancel
                        </Button>
                        <LoadingButton
                          variant="contained"
                          color="success"
                          endIcon={<Check />}
                          onClick={handleSaveCal}
                          loading={isSavingCal}
                          disabled={
                            isSavingCal || isDeletingCal || !editCalName
                          }
                        >
                          Save
                        </LoadingButton>
                      </Stack>
                    </Stack>
                  </>
                )}
              </Paper>
              <Paper
                variant="elevation"
                elevation={8}
                sx={{
                  mt: 3,
                  p: { md: 3, xs: 2 },
                }}
              >
                <Typography variant="h5" sx={{ mr: 'auto' }}>
                  Upcoming Registration Deadlines
                </Typography>
                <Stack direction="column" gap={1} sx={{ mt: 2 }}>
                  {calendar.events.filter((ev) => !!ev.deadline).length ===
                    0 && (
                    <Typography color="text.secondary" fontStyle="italic">
                      No upcoming registration deadlines
                    </Typography>
                  )}
                  {calendar.events.map(
                    (value) =>
                      value.deadline &&
                      value.deadline !== null && (
                        <Typography
                          key={value._id}
                          onClick={() => setCurrEvent(value)}
                          sx={{
                            '&:hover': {
                              cursor: 'pointer',
                            },
                          }}
                        >
                          <>
                            <strong>{value.title}:</strong>{' '}
                            {dateStringNoSec(new Date(value.deadline))}
                          </>
                        </Typography>
                      )
                  )}
                </Stack>
              </Paper>
              <Paper
                variant="elevation"
                elevation={8}
                sx={{
                  mt: 3,
                  p: { md: 3, xs: 2 },
                }}
              >
                {!isCreatingEvent && !isEditingEvent ? (
                  <>
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
                      <Stack direction="row" gap={1}>
                        {(calendar.owner === user.id ||
                          (calendar.type === CalendarType.GROUP &&
                            verifyPermissions(
                              user.id,
                              calendar as IGroupCalendar,
                              [
                                GroupCalendarRole.EDITOR,
                                GroupCalendarRole.ADMIN,
                              ]
                            ))) &&
                          currEvent && (
                            <Button
                              variant="outlined"
                              endIcon={<Edit />}
                              onClick={handleEditEvent}
                            >
                              Edit
                            </Button>
                          )}
                        {(calendar.owner === user.id ||
                          (calendar.type === CalendarType.GROUP &&
                            verifyPermissions(
                              user.id,
                              calendar as IGroupCalendar,
                              [
                                GroupCalendarRole.EDITOR,
                                GroupCalendarRole.ADMIN,
                              ]
                            ))) && (
                          <Button
                            variant="outlined"
                            endIcon={<Add />}
                            onClick={() => setIsCreatingEvent(true)}
                          >
                            Create new
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                    {currEvent ? (
                      <Stack direction="column">
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {currEvent.title}
                        </Typography>
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
                          {currEvent.deadline !== null && currEvent.deadline ? (
                            <Typography>
                              <>
                                <strong>Deadine to Register: </strong>{' '}
                                {dateStringNoSec(new Date(currEvent.deadline))}
                              </>
                            </Typography>
                          ) : (
                            <Typography>
                              {' '}
                              <>
                                <strong>Deadline to Register: </strong>{' '}
                              </>{' '}
                              No deadline.{' '}
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
                                }[currEvent.rrule.freq as number]
                              }
                              {currEvent.rrule.interval > 1 ? 's' : ''}
                            </Typography>
                            {currEvent.rrule.freq === RRule.WEEKLY && (
                              <Typography>
                                <b>Days Repeated:</b>{' '}
                                {currEvent.rrule.byweekday
                                  .map(
                                    (dow: number) =>
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
                                  ? `Every day ${dayjs(
                                      currEvent.startTime
                                    ).date()}`
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
                                      DAYS_OF_WEEK[
                                        dayjs(currEvent.startTime).day()
                                      ]
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

                        <EventShare
                          event={currEvent}
                          invites={eventInvites}
                          setInvites={setEventInvites}
                          ownerUsername={user.username}
                          calendar={calendar}
                        />
                      </Stack>
                    ) : (
                      <Typography color="text.secondary" fontStyle="italic">
                        No event selected
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <TextField
                      label="Event Title"
                      value={editEventTitle}
                      required
                      fullWidth
                      margin="normal"
                      onChange={(e) => setEditEventTitle(e.target.value)}
                      placeholder="Give the event an extraordinary name"
                    />
                    <TextField
                      margin="normal"
                      label="Description"
                      value={editEventDesc}
                      fullWidth
                      multiline
                      minRows={3}
                      onChange={(e) => setEditEventDesc(e.target.value)}
                      placeholder="Add a lil' description"
                    />
                    {editEventAllDay ? (
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        columnGap={2}
                        sx={{ mt: 2 }}
                      >
                        <DatePicker
                          label="Event Date"
                          value={editEventStart}
                          onChange={(val) => {
                            if (val) {
                              setEditEventStart(val)
                              if (editEventAllDay) {
                                setEditEventEnd(val.endOf('day'))
                              }
                            }
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editEventAllDay}
                              onChange={(e) =>
                                setEditEventAllDay(e.target.checked)
                              }
                            />
                          }
                          label="All day"
                        />
                      </Stack>
                    ) : (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xl={6} lg={12} sm={6} xs={12}>
                          <DateTimePicker
                            label="Start Time"
                            sx={{ width: '100%' }}
                            value={editEventStart}
                            onChange={(val) => {
                              if (val) {
                                setEditEventStart(val)
                              }
                            }}
                            maxDateTime={editEventEnd}
                          />
                        </Grid>
                        <Grid item xl={6} lg={12} sm={6} xs={12}>
                          <DateTimePicker
                            label="End Time"
                            sx={{ width: '100%' }}
                            value={editEventEnd}
                            onChange={(val) => {
                              if (val) {
                                setEditEventEnd(val)
                              }
                            }}
                            minDateTime={editEventStart}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={editEventAllDay}
                                onChange={(e) => {
                                  setEditEventAllDay(e.target.checked)
                                  setEditEventStart(
                                    editEventStart.startOf('day')
                                  )
                                  setEditEventEnd(editEventStart.endOf('day'))
                                }}
                              />
                            }
                            label="All day"
                          />
                        </Grid>
                      </Grid>
                    )}
                    <Stack direction="column" gap={1} alignItems="left">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editEventRepeats}
                            onChange={(e) => {
                              setEditEventRepeats(e.target.checked)
                              if (editEventRecUntil?.isBefore(editEventStart)) {
                                setEditEventRecUntil(
                                  editEventStart.endOf('day')
                                )
                              }
                            }}
                          />
                        }
                        label="Repeats"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={hasDeadline}
                            onChange={(e) => {
                              setHasDeadline(e.target.checked)
                            }}
                          />
                        }
                        label="Include Registration Deadline"
                      />
                    </Stack>
                    {hasDeadline && (
                      <DateTimePicker
                        sx={{ mt: 1 }}
                        label="Registration Deadline"
                        value={deadlineDate}
                        onChange={(val) => {
                          if (val) {
                            setDeadlineDate(val)
                          }
                        }}
                      />
                    )}
                    {editEventRepeats && (
                      <Box sx={{ mt: 2 }}>
                        <Stack direction="row" gap={1} alignItems="center">
                          <Typography>Repeats every</Typography>
                          <TextField
                            type="number"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            inputProps={{
                              size: '3',
                              min: 1,
                            }}
                            value={editEventInterval}
                            onChange={(e) =>
                              setEditEventInterval(parseInt(e.target.value, 10))
                            }
                            size="small"
                          />
                          <Select
                            value={editEventFreqUnit}
                            onChange={(e) =>
                              setEditEventFreqUnit(e.target.value as Frequency)
                            }
                            size="small"
                          >
                            <MenuItem value={RRule.DAILY}>
                              day{editEventInterval > 1 ? 's' : ''}
                            </MenuItem>
                            <MenuItem value={RRule.WEEKLY}>
                              week{editEventInterval > 1 ? 's' : ''}
                            </MenuItem>
                            <MenuItem value={RRule.MONTHLY}>
                              month{editEventInterval > 1 ? 's' : ''}
                            </MenuItem>
                            <MenuItem value={RRule.YEARLY}>
                              year{editEventInterval > 1 ? 's' : ''}
                            </MenuItem>
                          </Select>
                        </Stack>
                        {editEventFreqUnit === Frequency.WEEKLY && (
                          <Box sx={{ mt: 2 }}>
                            <Typography>Repeated Days</Typography>
                            <Stack
                              direction="row"
                              flexWrap="wrap"
                              gap={1}
                              sx={{ mt: 1 }}
                            >
                              {[
                                RRule.SU,
                                RRule.MO,
                                RRule.TU,
                                RRule.WE,
                                RRule.TH,
                                RRule.FR,
                                RRule.SA,
                              ].map((dow) => (
                                <Chip
                                  key={dow.toString()}
                                  label={dow.toString()}
                                  color={
                                    editEventDow.includes(dow.weekday)
                                      ? 'primary'
                                      : 'default'
                                  }
                                  variant={
                                    editEventDow.includes(dow.weekday)
                                      ? 'filled'
                                      : 'outlined'
                                  }
                                  // disabled={editEventStart.day() === idx}
                                  onClick={() => {
                                    if (!editEventDow.includes(dow.weekday)) {
                                      setEditEventDow((prev) => [
                                        ...prev,
                                        dow.weekday,
                                      ])
                                    } else {
                                      setEditEventDow((prev) =>
                                        prev.filter((d) => d !== dow.weekday)
                                      )
                                    }
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                        {editEventFreqUnit === Frequency.MONTHLY && (
                          <Select
                            value={editEventRecMonth}
                            onChange={(e) =>
                              setEditEventRecMonth(
                                e.target.value as MonthlyOption
                              )
                            }
                            sx={{ mt: 2 }}
                            size="small"
                          >
                            <MenuItem value={MonthlyOption.MONTHLY_DAY}>
                              Monthly on day {editEventStart.date()}
                            </MenuItem>
                            <MenuItem value={MonthlyOption.MONTHLY_WEEKDAY}>
                              Monthly on{' '}
                              {
                                ['first', 'second', 'third', 'last'][
                                  Math.max(
                                    editEventStart.diff(
                                      editEventStart.startOf('month'),
                                      'week'
                                    ),
                                    1
                                  ) - 1
                                ]
                              }{' '}
                              {DAYS_OF_WEEK[editEventStart.day()]}
                            </MenuItem>
                          </Select>
                        )}
                        <Box sx={{ mt: 2 }}>
                          <Typography>Ends</Typography>
                          <RadioGroup
                            value={editEventRepeatEnd}
                            onChange={(e) => {
                              setEditEventRepeatEnd(
                                parseInt(
                                  e.target.value,
                                  10
                                ) as EventRepeatOption
                              )
                            }}
                          >
                            <FormControlLabel
                              value={EventRepeatOption.NEVER}
                              control={<Radio />}
                              label="Never"
                            />
                            <Stack
                              direction="row"
                              alignItems="center"
                              sx={{ my: 1 }}
                            >
                              <FormControlLabel
                                value={EventRepeatOption.UNTIL}
                                control={<Radio />}
                                label="On"
                              />
                              <DatePicker
                                value={editEventRecUntil}
                                minDate={editEventStart}
                                onChange={(val) => {
                                  if (val) {
                                    setEditEventRecUntil(val)
                                  }
                                }}
                                disabled={
                                  editEventRepeatEnd !== EventRepeatOption.UNTIL
                                }
                              />
                            </Stack>
                            <Stack direction="row" alignItems="center">
                              <FormControlLabel
                                value={EventRepeatOption.OCCURS}
                                control={<Radio />}
                                label="After"
                              />
                              <TextField
                                type="number"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{
                                  size: '3',
                                  min: 1,
                                }}
                                value={editEventRecurrences}
                                onChange={(e) =>
                                  setEditEventRecurrences(
                                    parseInt(e.target.value, 10)
                                  )
                                }
                                size="small"
                                disabled={
                                  editEventRepeatEnd !==
                                  EventRepeatOption.OCCURS
                                }
                              />
                              <Typography
                                color={
                                  editEventRepeatEnd !==
                                  EventRepeatOption.OCCURS
                                    ? 'text.secondary'
                                    : 'text.primary'
                                }
                                sx={{ ml: 1 }}
                              >
                                occurences
                              </Typography>
                            </Stack>
                          </RadioGroup>
                        </Box>
                      </Box>
                    )}

                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      justifyContent="space-between"
                      sx={{ mt: 3 }}
                    >
                      <LoadingButton
                        variant="outlined"
                        color="error"
                        endIcon={<Delete />}
                        disabled={isSavingEvent}
                        loading={isDeletingEvent}
                        onClick={handleDeleteEvent}
                      >
                        Delete
                      </LoadingButton>
                      <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Stack direction="row" gap={1}>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={handleCancelCreateEditEvent}
                            disabled={isSavingEvent}
                          >
                            Cancel
                          </Button>
                          {isCreatingEvent ? (
                            <LoadingButton
                              variant="contained"
                              color="success"
                              endIcon={<Add />}
                              onClick={handleCreateEvent}
                              loading={isSavingCal}
                              disabled={isSavingEvent || !checkEventFields()}
                            >
                              Create
                            </LoadingButton>
                          ) : (
                            <LoadingButton
                              variant="contained"
                              color="success"
                              endIcon={<Check />}
                              onClick={handleSaveEvent}
                              loading={isSavingCal}
                              disabled={isSavingEvent || !checkEventFields()}
                            >
                              Save
                            </LoadingButton>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </>
                )}
              </Paper>
            </Stack>
          </Grid>
          <Grid item lg={8} xs={12}>
            <Paper
              variant="elevation"
              elevation={8}
              sx={{
                p: { md: 3, xs: 2 },
                border: 'solid',
                borderWidth: 7,
                borderColor: isEditing ? editCalColor : calendar.color,
              }}
            >
              <Calendar
                style={{
                  height: '70vh',
                }}
                eventsAndColors={eventsAndColors}
                onEventClick={(e, d, de) => {
                  setCurrEvent(e)
                  setCurrDate(d)
                  setCurrDateEnd(de)
                }}
              />
            </Paper>
          </Grid>
        </Grid>
        <ConfirmDialog
          title={`Delete ${calendar.name}?`}
          message="Delete this calendar? This cannot be reversed"
          open={confirmDeleteCal}
          onClose={() => setConfirmDeleteCal(false)}
          onConfirm={handleConfirmDeleteCal}
          danger
        />
        <ConfirmDialog
          title={`Delete event "${currEvent?.title}"?`}
          message="Delete this event? This cannot be reversed"
          open={confirmDeleteEvent}
          onClose={() => setConfirmDeleteEvent(false)}
          onConfirm={handleConfirmDeleteEvent}
          danger
        />
        <CalendarShareDialog
          calendar={calendar}
          open={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          hydrateCalendar={hydrateCalendar}
          userId={user._id}
        />
      </Box>
    </>
  )
}

export default CalendarView

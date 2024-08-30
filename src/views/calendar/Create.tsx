import { ArrowBack } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Container,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import to from 'await-to-js'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import { TwitterPicker } from 'react-color'
import { toast } from 'react-toastify'

import CalendarTags from '@/components/CalendarTags'
import DefaultLoadingView from '@/components/Loading/Default'
import Navbar from '@/components/Navbar'
import DEFAULT_PALETTE from '@/constants/palette'
import TOAST_CONFIG from '@/constants/toastconfig'
import useAuth from '@/hooks/useAuth'
import { CalendarType, Visibility } from '@/types/enums'
import parseICal from '@/utils/calendar/parse'

import type { ChangeEvent } from 'react'

const CreateCalendarView = () => {
  const { user } = useAuth(true)
  const router = useRouter()
  const theme = useTheme()

  const inputFileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(DEFAULT_PALETTE[0])
  const [isPublic, setIsPublic] = useState(false)
  const [calendarType, setCalendarType] = useState(CalendarType.CALENDAR)
  const [tags, setTags] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const [isParsingFile, setIsParsingFile] = useState(false)

  if (!user) return <DefaultLoadingView />

  const createCalendar = async (payload: Record<string, any>) => {
    const res = await axios
      .post('/api/calendar', {
        payload,
      })
      .catch((e) => ({ status: e.response.status, data: undefined }))

    if (res.status !== 200 || !res.data || !res.data.calendar) {
      toast.error(
        'There was an error creating the calendar! Try again later',
        TOAST_CONFIG
      )

      return null
    }

    const { _id: id } = res.data.calendar as ICalendar
    return id
  }

  const handleCreate = async () => {
    setIsCreating(true)

    const id = await createCalendar({
      name,
      description,
      color,
      visibility: isPublic ? Visibility.PUBLIC : Visibility.PRIVATE,
      tags,
      type: calendarType,
    })
    if (id) router.push(`/calendar/${id}`)

    setIsCreating(false)
  }

  const onFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const file = e.target.files[0]
    if (file.type !== 'text/calendar') return

    setIsParsingFile(true)

    const reader = new FileReader()
    reader.onload = async () => {
      const text = reader.result

      let calendar: DeepPartial<ICalendar> | null = null
      try {
        calendar = parseICal(text as string)
      } catch (err) {
        toast.error('Cannot import file', TOAST_CONFIG)
        e.target.value = ''
        setIsParsingFile(false)
        return
      }

      if (!calendar) return

      const id = await createCalendar({
        name: calendar.name,
        description: calendar.description,
        color: DEFAULT_PALETTE[0],
      })

      if (!id || !calendar.events?.length) {
        e.target.value = ''
        setIsParsingFile(false)
        return
      }

      await Promise.all(
        await calendar.events?.map(async (ev) => {
          const [err, res] = await to(
            axios.post('/api/event', {
              payload: {
                calendar: id,
                ...ev,
              },
            })
          )

          if (err || !res) {
            e.target.value = ''
            setIsParsingFile(false)
          }
        })
      )

      router.push(`/calendar/${id}`)
    }
    reader.readAsText(file)
  }

  return (
    <>
      <Navbar user={user} />
      <Container sx={{ mt: 12, mb: 5 }} maxWidth="xs">
        <Paper variant="elevation" elevation={8} sx={{ p: { md: 3, xs: 2 } }}>
          {/* alternatively some url */}
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ mt: 1 }}>
            <Typography variant="h5" textAlign="center">
              Create Calendar
            </Typography>
            <Box
              sx={{ mt: 2 }}
              component="form"
              onSubmit={(e: any) => e.preventDefault()}
            >
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                required
                placeholder="Put an extravagant calendar name"
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Description"
                placeholder="Put a lil' description"
                multiline
                minRows={3}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Stack direction="row" alignItems="center">
                <Typography>Public Calendar:</Typography>
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              </Stack>
              <Stack direction="row" alignItems="center">
                <Typography>Group Calendar:</Typography>
                <Switch
                  checked={calendarType === CalendarType.GROUP}
                  onChange={(e) =>
                    setCalendarType(
                      e.target.checked
                        ? CalendarType.GROUP
                        : CalendarType.CALENDAR
                    )
                  }
                />
              </Stack>
              <CalendarTags setTags={setTags} tags={tags} />
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ mb: 2, mt: 2 }}
                >
                  <Typography>Event color: </Typography>
                  <Box
                    sx={{
                      border: 'solid',
                      borderWidth: '0.5px',
                      borderColor: '#ABB8C3',
                      backgroundColor: color,
                      width: '2em',
                      height: '1em',
                      ml: 1,
                    }}
                  />
                </Stack>
                <TwitterPicker
                  triangle="hide"
                  width="100%"
                  color={color}
                  onChange={(c) => setColor(c.hex)}
                  colors={DEFAULT_PALETTE}
                  styles={{
                    default: {
                      card: {
                        backgroundColor:
                          theme.palette.mode === 'light' ? 'white' : '#2a2a2a',
                      },
                      input: {
                        color: theme.palette.text.primary,
                        backgroundColor:
                          theme.palette.mode === 'light' ? 'white' : '#2a2a2a',
                      },
                    },
                  }}
                />
              </Box>
              <LoadingButton
                type="submit"
                fullWidth
                variant="contained"
                onClick={handleCreate}
                sx={{ mt: 3, mb: 2 }}
                loading={isCreating}
                disabled={!name || isParsingFile}
              >
                Create
              </LoadingButton>
            </Box>
          </Box>

          <Stack alignItems="center">
            <input
              type="file"
              ref={inputFileRef}
              style={{ display: 'none' }}
              onChange={onFileUpload}
              accept=".ics"
            />
            <LoadingButton
              type="button"
              variant="contained"
              onClick={() => inputFileRef.current?.click()}
              sx={{ mt: 3, mb: 2 }}
              loading={isParsingFile}
            >
              Import Calendar
            </LoadingButton>
          </Stack>
        </Paper>
      </Container>
    </>
  )
}

export default CreateCalendarView

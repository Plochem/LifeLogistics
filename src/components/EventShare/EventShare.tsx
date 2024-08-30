import Clear from '@mui/icons-material/Clear'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import to from 'await-to-js'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import TOAST_CONFIG from '@/constants/toastconfig'
import useAuth from '@/hooks/useAuth'
import { CalendarType, GroupCalendarRole, InviteStatus } from '@/types/enums'
import { verifyPermissions } from '@/utils/calendar/role'

import type { AxiosError, AxiosResponse } from 'axios'
import type { Dispatch, SetStateAction } from 'react'

type Props = {
  event?: IEvent
  invites: string[]
  setInvites: Dispatch<SetStateAction<string[]>>
  ownerUsername: string
  calendar: ICalendar
}

const EventShare = ({
  event,
  invites,
  setInvites,
  ownerUsername,
  calendar,
}: Props) => {
  const [eventInviteUser, setEventInviteUser] = useState('')
  const [populatedEvent, setPopulatedEvent] = useState<IEvent | null>(null)
  const [sendingInvite, setSendingInvite] = useState(false)

  const { user } = useAuth(true)

  const populateEvent = (eventId: string) =>
    axios.get(`/api/event/${eventId}/populate`)

  useEffect(() => {
    ;(async () => {
      if (!event) {
        setPopulatedEvent(null)
        setInvites([])
        return
      }

      const [err, res] = await to(populateEvent(event._id))
      if (err || !res.data?.event) {
        setPopulatedEvent(null)
        return
      }
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const _event = res.data.event as IEvent

      if (!_event) setInvites([])

      setPopulatedEvent(res.data.event as IEvent)
      setInvites((_event.invites || []).map(({ username }) => username))
    })()
  }, [event])

  const inviteUser = async () => {
    if (!populatedEvent) return

    setSendingInvite(true)
    const username = eventInviteUser
    setEventInviteUser('')

    const [error, res] = await to<AxiosResponse, AxiosError>(
      axios.post(`/api/event/${populatedEvent._id}/invite`, {
        username,
      })
    )

    if (error) {
      if (error?.response?.status === 404)
        toast.error('User does not exist', TOAST_CONFIG)
      else if (error?.response?.status === 409) {
        toast.error((error.response.data as any).message, TOAST_CONFIG)
      } else
        toast.error('Could not invite user, please try again', TOAST_CONFIG)

      setSendingInvite(false)
      return
    }

    toast.success(`Invited ${username}!`, TOAST_CONFIG)

    if (!res.data?.event) {
      setSendingInvite(false)
      return
    }

    const [err, res2] = await to(populateEvent((res.data.event as IEvent)._id))
    if (err || !res2.data?.event) {
      setPopulatedEvent(null)
      setInvites([])
      return
    }

    setPopulatedEvent(res2.data.event as IEvent)
    setInvites(
      ((res2.data.event.invites as IUser[]) || []).map(
        ({ username: _username }) => _username
      )
    )
    setSendingInvite(false)
  }

  const removeUser = async (username: string) => {
    if (!event) return

    const [error, res] = await to(
      axios.delete(`/api/event/${event._id}/invite`, { params: { username } })
    )

    if (error) {
      toast.error('Could not remove user, please try again', TOAST_CONFIG)
      return
    }

    toast.success(`Removed ${username}!`, TOAST_CONFIG)

    if (!res.data?.event) return

    const [err, res2] = await to(populateEvent((res.data.event as IEvent)._id))
    if (err || !res2.data?.event) {
      setPopulatedEvent(null)
      return
    }

    setPopulatedEvent(res2.data.event as IEvent)
    setInvites(
      ((res2.data.event.invites as IUser[]) || []).map(
        ({ username: _username }) => _username
      )
    )
  }

  if (!user || !calendar) return null

  return (
    <Box sx={{ mt: 2 }}>
      <hr />
      {user &&
        calendar &&
        (calendar.owner === user._id ||
          (calendar.type === CalendarType.GROUP &&
            verifyPermissions(user._id, calendar as IGroupCalendar, [
              GroupCalendarRole.ADMIN,
              GroupCalendarRole.EDITOR,
            ]))) && (
          <>
            <Typography variant="h6">Share event</Typography>
            <Stack direction="row" gap={2} sx={{ my: 2 }} flexWrap="wrap">
              <TextField
                label="Invite user"
                value={eventInviteUser}
                sx={{ width: 400 }}
                onChange={(e) => setEventInviteUser(e.target.value)}
                placeholder="Invite user"
                size="small"
              />
              <Button
                onClick={inviteUser}
                variant="contained"
                sx={{ px: 3 }}
                disabled={sendingInvite || !eventInviteUser.length}
              >
                Invite
              </Button>
            </Stack>
          </>
        )}
      {(invites.length > 0 ||
        (populatedEvent?.sharedUsers || []).length > 0) && (
        <>
          <Typography variant="h6">Invited users</Typography>

          <Stack
            sx={{ maxHeight: 200, maxWidth: 450, pr: 2, overflowY: 'auto' }}
          >
            {invites
              .map((username) => ({ username, status: InviteStatus.PENDING }))
              .concat(
                (populatedEvent?.sharedUsers || []).map(({ username }) => ({
                  username,
                  status: InviteStatus.ACCEPTED,
                }))
              )
              .map(({ username, status }) => (
                <Stack
                  key={username}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    border: '2px solid #949494',
                    borderRadius: 2,
                    py: 0.5,
                    px: 1,
                  }}
                  my={0.5}
                >
                  <Typography fontStyle="italic">{username}</Typography>

                  {status === InviteStatus.PENDING ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Tooltip title="Pending Invite">
                        <HourglassBottomIcon sx={{ color: '#0000008a' }} />
                      </Tooltip>
                      {ownerUsername !== username &&
                        user &&
                        (calendar.owner === user._id ||
                          (calendar.type === CalendarType.GROUP &&
                            verifyPermissions(
                              user._id,
                              calendar as IGroupCalendar,
                              [
                                GroupCalendarRole.ADMIN,
                                GroupCalendarRole.EDITOR,
                              ]
                            ))) && (
                          <Tooltip title="Remove Invite">
                            <IconButton
                              onClick={() => removeUser(username)}
                              sx={{ ml: 0.5 }}
                            >
                              <Clear />
                            </IconButton>
                          </Tooltip>
                        )}
                    </Stack>
                  ) : (
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Tooltip title="Accepted Invite">
                        <HowToRegIcon sx={{ color: '#0000008a' }} />
                      </Tooltip>
                      {ownerUsername !== username &&
                        user &&
                        (calendar.owner === user._id ||
                          (calendar.type === CalendarType.GROUP &&
                            verifyPermissions(
                              user._id,
                              calendar as IGroupCalendar,
                              [
                                GroupCalendarRole.ADMIN,
                                GroupCalendarRole.EDITOR,
                              ]
                            ))) && (
                          <Tooltip title="Remove User">
                            <IconButton
                              onClick={() => removeUser(username)}
                              sx={{ ml: 0.5 }}
                            >
                              <Clear />
                            </IconButton>
                          </Tooltip>
                        )}
                    </Stack>
                  )}
                </Stack>
              ))}
          </Stack>
        </>
      )}
    </Box>
  )
}

export default EventShare

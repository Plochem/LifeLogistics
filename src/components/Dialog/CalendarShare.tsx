import { Clear, Link } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import to from 'await-to-js'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import TOAST_CONFIG from '@/constants/toastconfig'
import { CalendarType, GroupCalendarRole } from '@/types/enums'

import type { AxiosError, AxiosResponse } from 'axios'

type ShareCalendarProps = {
  open: boolean
  onClose: () => void
  calendar: ICalendar | IGroupCalendar
  hydrateCalendar: () => Promise<void>
  userId: string
}

const CalendarShareDialog = ({
  open,
  onClose,
  calendar,
  hydrateCalendar,
  userId,
}: ShareCalendarProps) => {
  const [newUser, setNewUser] = useState('')
  const [newUserRole, setNewUserRole] = useState(GroupCalendarRole.VIEWER)
  const [sendingInvite, setSendingInvite] = useState(false)

  const inviteUser = async () => {
    setSendingInvite(true)
    const username = newUser
    setNewUser('')

    const [error] = await to<AxiosResponse, AxiosError>(
      axios.post(`/api/calendar/${calendar._id}/invite`, {
        role: newUserRole,
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

    await hydrateCalendar()

    toast.success(`Invited ${username}!`, TOAST_CONFIG)

    setSendingInvite(false)
  }

  const updateInviteAccess = async (
    invitedUserId: string,
    role: GroupCalendarRole
  ) => {
    // TODO update invite access
  }

  const removeInvite = async (invitedUserId: string) => {
    // TODO remove invite
    const [err, res] = await to(
      axios.delete(`/api/calendar/${calendar._id}/invite`, {
        params: {
          userId: invitedUserId,
          calendarId: calendar._id,
        },
      })
    )

    if (err || !res || res.status !== 200) {
      toast.error('Could not remove invite, please try again!', TOAST_CONFIG)
    } else {
      toast.success(`Removed invite!`, TOAST_CONFIG)
    }

    await hydrateCalendar()
  }

  const removeCollaborator = async (collaboratorId: string) => {
    const [error] = await to<AxiosResponse, AxiosError>(
      axios.delete(`/api/calendar/${calendar._id}/role`, {
        data: { user: collaboratorId },
      })
    )

    if (error) {
      if (error?.response?.status === 404)
        toast.error('User does not exist', TOAST_CONFIG)
      else if (error?.response?.status === 409) {
        toast.error((error.response.data as any).message, TOAST_CONFIG)
      } else
        toast.error('Could not remove user, please try again', TOAST_CONFIG)

      return
    }

    await hydrateCalendar()
  }

  const updateCollaborationAccess = async (
    collaboratorId: string,
    role: GroupCalendarRole
  ) => {
    const [error] = await to<AxiosResponse, AxiosError>(
      axios.patch(`/api/calendar/${calendar._id}/role`, {
        user: collaboratorId,
        role,
      })
    )

    if (error) {
      if (error?.response?.status === 404)
        toast.error('User does not exist', TOAST_CONFIG)
      else if (error?.response?.status === 409) {
        toast.error((error.response.data as any).message, TOAST_CONFIG)
      } else
        toast.error(
          'Could not change user role, please try again',
          TOAST_CONFIG
        )

      return
    }

    await hydrateCalendar()
  }

  const handleCopyLink = async () => {
    const [err, res] = await to(
      navigator.clipboard.writeText(window.location.href)
    )
    if (!err) {
      toast.success('Copied calendar link to clipboard!', TOAST_CONFIG)
    } else {
      toast.error('Error copying calendar link!', TOAST_CONFIG)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Share &quot;{calendar.name}&quot;</DialogTitle>
      <DialogContent sx={{ width: '100%' }}>
        <Stack
          direction="row"
          gap={2}
          sx={{ width: '100%', my: 2 }}
          flexWrap="wrap"
        >
          <TextField
            label="Invite User"
            value={newUser}
            fullWidth
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Invite users to group calendar"
            size="small"
          />
          <Select
            value={newUserRole}
            size="small"
            onChange={(e) =>
              setNewUserRole(e.target.value as GroupCalendarRole)
            }
          >
            <MenuItem value={GroupCalendarRole.VIEWER}>Viewer</MenuItem>
            <MenuItem value={GroupCalendarRole.EDITOR}>Editor</MenuItem>
            <MenuItem value={GroupCalendarRole.ADMIN}>Admin</MenuItem>
          </Select>
          <Button
            onClick={inviteUser}
            variant="contained"
            sx={{ px: 3 }}
            disabled={sendingInvite || !newUser.length}
          >
            Invite
          </Button>
        </Stack>
        <Divider />
        <Box sx={{ my: 1 }}>
          <Typography>Pending Invites:</Typography>
          <Stack direction="column" gap={2} sx={{ mt: 1 }}>
            {((calendar as IGroupCalendar)?.invites ?? []).length === 0 && (
              <Typography fontStyle="italic" color="text.secondary">
                No pending invites
              </Typography>
            )}
            {((calendar as IGroupCalendar)?.invites ?? []).map((invite) => (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                my={0.5}
                key={invite.user._id}
              >
                <Typography fontStyle="italic">
                  {invite.user.username}
                </Typography>

                <Typography
                  fontStyle="italic"
                  color="text.secondary"
                  sx={{ ml: 'auto' }}
                >
                  {invite.role}
                </Typography>
                <Tooltip title="Remove Invite">
                  <IconButton
                    onClick={() => removeInvite(invite.user._id)}
                    sx={{ ml: 1 }}
                  >
                    <Clear />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ my: 1 }}>
          <Typography>People with access:</Typography>
          <Stack direction="column" mt={1}>
            {((calendar as IGroupCalendar)?.collaborators ?? []).length ===
              0 && (
              <Typography fontStyle="italic" color="text.secondary">
                No collaborators
              </Typography>
            )}
            {((calendar as IGroupCalendar)?.collaborators ?? []).map(
              (person) => (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  my={0.5}
                  key={person.user._id}
                >
                  <Typography fontStyle="italic">
                    {person.user.username}
                    {person.user._id === userId ? ' (You)' : ''}
                    {person.user._id === calendar.owner ? ' (Owner)' : ''}
                  </Typography>
                  <Box>
                    {person.user._id === userId ||
                    person.user._id === calendar.owner ? (
                      <Typography fontStyle="italic" color="text.secondary">
                        {person.role}
                      </Typography>
                    ) : (
                      <Select
                        value={person.role}
                        size="small"
                        onChange={(e) =>
                          updateCollaborationAccess(
                            person.user._id,
                            e.target.value as GroupCalendarRole
                          )
                        }
                      >
                        <MenuItem value={GroupCalendarRole.VIEWER}>
                          Viewer
                        </MenuItem>
                        <MenuItem value={GroupCalendarRole.EDITOR}>
                          Editor
                        </MenuItem>
                        <MenuItem value={GroupCalendarRole.ADMIN}>
                          Admin
                        </MenuItem>
                      </Select>
                    )}
                    {person.user._id !== userId &&
                      person.user._id !== calendar.owner && (
                        <Tooltip title="Remove Member">
                          <IconButton
                            onClick={() => removeCollaborator(person.user._id)}
                            sx={{ ml: 1 }}
                          >
                            <Clear />
                          </IconButton>
                        </Tooltip>
                      )}
                  </Box>
                </Stack>
              )
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ m: 1 }}>
        <Button
          onClick={handleCopyLink}
          startIcon={<Link />}
          sx={{ mr: 'auto' }}
          variant="outlined"
        >
          Copy Link
        </Button>
        <Button onClick={onClose} variant="contained" autoFocus>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CalendarShareDialog

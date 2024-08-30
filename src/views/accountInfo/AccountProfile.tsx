/* eslint-disable import/no-extraneous-dependencies */
import {
  ArrowForward,
  VisibilityOff,
  Visibility as VisibilityOn,
} from '@mui/icons-material'
import { Add } from '@mui/icons-material'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import to from 'await-to-js'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import CalendarCard from '@/components/CalendarCard'
import DefaultLoadingView from '@/components/Loading/Default'
import Navbar from '@/components/Navbar'
import useAuth from '@/hooks/useAuth'

type AccountProfileProps = {
  username?: string
}

// Actual Page Displayed based on user logged in
// if undefined passed in, display current user logged in
const AccountProfile = ({ username }: AccountProfileProps) => {
  const [bio, setBio] = useState('')
  const [name, setName] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [calendars, setCalendars] = useState([] as ICalendar[])
  const [noProfile, setNoProfile] = useState(false)
  const router = useRouter()
  const { user, status } = useAuth(true)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<IUser>()

  const pinnedCalendars = useMemo(
    () => user?.pinnedCalendars.map(({ _id }) => _id) || [],
    [user]
  )

  const getAccountInfo = async () => {
    if (status === 'authenticated' && user) {
      if (!username) {
        setName(user.name ?? user.username)
        setEmailAddress(user.email ?? '')
        setProfilePicture(user.image ?? '')
        setBio(user.bio)
        setCalendars(user.calendars)
        setCurrentUser(user)
      } else {
        const [error, res] = await to(axios.get(`/api/user/${username}`))
        // could prob do without this but im paranoid
        if (error || !res || !res.data || !res.data.users) {
          setNoProfile(true)
        } else {
          const userResult = res.data.users[0] as IUser
          setName(userResult.name ?? username)
          setEmailAddress(userResult.email ?? '')
          setProfilePicture(userResult.image ?? '')
          setBio(userResult.bio)
          setCalendars(userResult.calendars)

          // better to save the entire user obj as state
          setCurrentUser(userResult)
        }
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    getAccountInfo()
  }, [username, status])

  const viewingOwnProfile = !username || username === user?.username

  if (noProfile) {
    router.push('/404')
    return <DefaultLoadingView />
  }

  if (loading || !user || !user.username) {
    return <DefaultLoadingView />
  }

  return (
    <>
      <Navbar user={user} />
      <Grid container spacing={5} sx={{ mt: 10, mb: 5, px: 5 }}>
        <Grid item md={4} xs={12}>
          <Paper variant="elevation" elevation={8} sx={{ p: { md: 3, xs: 2 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={profilePicture}
                sx={{
                  m: 1,
                  bgcolor: 'secondary.main',
                  width: 100,
                  height: 100,
                }}
              />
              <Typography component="h1" variant="h3" textAlign="center">
                {name}
              </Typography>
              <Typography
                component="h2"
                variant="h6"
                textAlign="center"
                sx={{ wordBreak: 'break-all' }}
              >
                @{viewingOwnProfile ? user.username : username} | {emailAddress}
              </Typography>
              <Typography textAlign="center" sx={{ my: 2 }}>
                {bio}
              </Typography>
              {viewingOwnProfile && (
                <Button
                  href="/user/edit"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push('/user/edit')
                  }}
                  endIcon={<ManageAccountsIcon />}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item md={8} xs={12}>
          <Grid item xs={12} mb={3}>
            <Paper
              variant="elevation"
              elevation={8}
              sx={{ p: { md: 3, xs: 2 } }}
            >
              <Stack
                direction="row"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
                sx={{ mb: 2 }}
              >
                <Typography variant="h4" sx={{ mr: 'auto' }}>
                  My Calendars
                </Typography>
                {viewingOwnProfile && (
                  <Button
                    variant="outlined"
                    endIcon={<Add />}
                    href="/calendar/create"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push('/calendar/create')
                    }}
                  >
                    Create
                  </Button>
                )}
              </Stack>
              {calendars.length === 0 && (
                <Typography
                  color="text.secondary"
                  fontStyle="italic"
                  sx={{ mb: 2 }}
                >
                  No{!viewingOwnProfile && ' public'} calendars
                </Typography>
              )}
              <Grid container spacing={2}>
                {calendars
                  .sort(({ _id: aId }, { _id: bId }) => {
                    if (pinnedCalendars.includes(aId)) return -1
                    if (pinnedCalendars.includes(bId)) return 1
                    return 0
                  })
                  .map((calendar) => (
                    <Grid item lg={4} sm={6} xs={12} key={calendar._id}>
                      <CalendarCard calendar={calendar} />
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Grid>

          {!!currentUser?.followedCalendars?.length && (
            <Grid item xs={12}>
              <Paper
                variant="elevation"
                elevation={8}
                sx={{ p: { md: 3, xs: 2 } }}
              >
                <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h4">Followed Calendars</Typography>
                </Stack>

                <Grid container spacing={2}>
                  {currentUser.followedCalendars
                    .sort(({ _id: aId }, { _id: bId }) => {
                      if (pinnedCalendars.includes(aId)) return -1
                      if (pinnedCalendars.includes(bId)) return 1
                      return 0
                    })
                    .map((calendar) => (
                      <Grid item lg={4} sm={6} xs={12} key={calendar._id}>
                        <CalendarCard calendar={calendar} />
                      </Grid>
                    ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default AccountProfile

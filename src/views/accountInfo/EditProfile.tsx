/* eslint-disable import/no-extraneous-dependencies */
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { LoadingButton } from '@mui/lab'
import {
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Switch,
} from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import DefaultLoadingView from '@/components/Loading/Default'
import Navbar from '@/components/Navbar'
import TOAST_CONFIG from '@/constants/toastconfig'
import useAuth from '@/hooks/useAuth'

// Actual Page Displayed based on user logged in
const EditProfile = () => {
  // This is the user that is logged in
  const { user } = useAuth()
  const router = useRouter()
  const [editUsername, setEditUsername] = useState('')
  const [editBio, setEditBio] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [visibility, setVisibility] = useState(user?.visibility ?? true)
  const [isUpdating, setIsUpdating] = useState(false)

  // by default use user's current settings (once loaded)
  useEffect(() => {
    if (user) {
      setEditUsername(user.username)
      setEditBio(user.bio)
      setVisibility(user.visibility)
    }
  }, [user])

  if (!user) return <DefaultLoadingView />

  const handleEdit = async () => {
    setIsUpdating(true)
    // prob better way of doing this but eh
    const payload =
      user.username === editUsername
        ? {
            visibility,
            bio: editBio,
          }
        : {
            username: editUsername,
            visibility,
            bio: editBio,
          }
    const res = await axios
      .patch('/api/user', { payload })
      .catch((e) => ({ status: e.response.status }))
    if (res.status === 409) {
      setUsernameError('That username already exists! Please try again.')
    } else if (res.status !== 200) {
      toast.error(
        'There was an error updating your profile! Please try again.',
        TOAST_CONFIG
      )
    } else {
      toast.success('Successfully updated profile!', TOAST_CONFIG)
      router.push(`/user`)
    }
    setIsUpdating(false)
  }

  return (
    <>
      <Navbar user={user} />
      <Container component="main" maxWidth="xs" sx={{ mt: 12, mb: 5 }}>
        <Paper
          variant="elevation"
          elevation={8}
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          {/* alternatively router.back() */}
          <IconButton onClick={() => router.push('/user')}>
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* <Avatar
              sx={{ m: 1, bgcolor: 'secondary.main', width: 100, height: 100 }}
              src={user.image ?? undefined}
            /> */}
            <Typography component="h1" variant="h5">
              Edit Profile
            </Typography>
            <Box
              component="form"
              onSubmit={(e: any) => e.preventDefault()}
              noValidate
              sx={{ mt: 1, p: 2 }}
            >
              <TextField
                margin="normal"
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                error={usernameError !== ''}
                helperText={usernameError}
                autoComplete="username"
              />
              <TextField
                margin="normal"
                fullWidth
                multiline
                minRows={3}
                name="bio"
                label="Bio"
                placeholder="Talk about yourself"
                type="bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                id="bio"
              />
              <Stack direction="row" alignItems="center">
                <Typography>Public Profile:</Typography>
                <Switch
                  checked={visibility}
                  onChange={(e) => setVisibility(e.target.checked)}
                />
              </Stack>
              <LoadingButton
                type="submit"
                fullWidth
                variant="contained"
                onClick={handleEdit}
                sx={{ mt: 3, mb: 2 }}
                loading={isUpdating}
              >
                Save
              </LoadingButton>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export default EditProfile

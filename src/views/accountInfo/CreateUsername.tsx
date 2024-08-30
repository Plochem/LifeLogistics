// eslint-disable-next-line import/no-extraneous-dependencies
import { LoadingButton } from '@mui/lab'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useState } from 'react'
import * as React from 'react'

import Navbar from '@/components/Navbar'
import useAuth from '@/hooks/useAuth'

import DefaultLoadingView from '../../components/Loading/Default'

const CreateUsername = () => {
  const { user } = useAuth(true)
  const router = useRouter()
  const [enteredUsername, setEnteredUsername] = useState('')
  const [acctError, setAcctError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  if (!user) return <DefaultLoadingView />
  if (user.username) {
    router.push((router.query.redirect as string) ?? '/user/edit')
    return <DefaultLoadingView />
  }

  const handleSubmit = async () => {
    setIsCreating(true)
    const res = await axios
      .patch('/api/user', {
        payload: {
          username: enteredUsername,
          visibility: true,
          bio: '',
          calendars: [],
        },
      })
      .catch((e) => ({ status: e.response.status }))

    if (res.status === 409) {
      setAcctError('That username already exists! Please try again.')
    } else if (res.status !== 200) {
      setAcctError(
        'There was an error creating your username! Please try again.'
      )
    } else {
      setAcctError('')
      router.push((router.query.redirect as string) ?? '/user')
    }
    setIsCreating(false)
  }

  return (
    <>
      <Navbar user={user} plain />
      <Container component="main" maxWidth="xs" sx={{ mt: 10, mb: 5 }}>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Choose your Username
          </Typography>
          <Box
            component="form"
            onSubmit={(e: any) => e.preventDefault()}
            id="mainForm"
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              onChange={(e) => setEnteredUsername(e.target.value)}
              error={acctError !== ''}
              helperText={acctError}
              autoFocus
            />
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{ mt: 3, mb: 2 }}
              loading={isCreating}
              disabled={!enteredUsername}
            >
              Create
            </LoadingButton>
          </Box>
        </Box>
      </Container>
    </>
  )
}

export default CreateUsername

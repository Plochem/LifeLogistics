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

const PrivacySecurity = () => {
  const { user } = useAuth(false)

  return (
    <>
      <Navbar user={user} />
      <Container component="main" maxWidth="lg" sx={{ mt: 10 }}>
        <Paper
          variant="elevation"
          elevation={8}
          sx={{ my: { xs: 4, md: 6 }, p: { xs: 4, md: 4 } }}
        >
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h4">
              <b>Privacy and Security</b>
            </Typography>
            <Typography component="h1" variant="subtitle1">
              Information Regarding Cookies and Personal Data
            </Typography>
            <Paper
              variant="elevation"
              elevation={8}
              sx={{ my: { xs: 4, md: 6 }, p: { xs: 4, md: 4 } }}
            >
              <Typography component="h1" variant="h5" align="center">
                How are your Cookies being used?
              </Typography>
              <Typography component="h1" variant="subtitle1">
                We use your cookies in order to make navigating our site as
                quick and responsive as possible. Collecting your cookies allows
                us to streamline the login process and keep your account
                associated with you. After you sign-in with either Google or
                Outlook, we use the cookies to enable you to sign-in again upon
                future visits as well as to keep track of who is currently
                signed in as you navigate our page so that things like your
                Profile and your Calendars remain unique to you.
              </Typography>
            </Paper>
            <Paper
              variant="elevation"
              elevation={8}
              sx={{ my: { xs: 4, md: 6 }, p: { xs: 4, md: 4 } }}
            >
              <Typography component="h1" variant="h5" align="center">
                Where is your data going?
              </Typography>
              <Typography component="h1" variant="subtitle1">
                Rest assured, we are not sending your data off to foreign
                countries or selling it to corporations for profit. Any of the
                data you submit to our website, besides information controlled
                by Google or Outlook, is merely stored in a single database
                cluster through MongoDB Atlas. What this means for you is that
                all of your data is secured and managed professionally, and we
                do not use any of it for personal gain or to exploit you in any
                way.
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export default PrivacySecurity

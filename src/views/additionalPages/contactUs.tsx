/* eslint-disable import/no-extraneous-dependencies */
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PieChartIcon from '@mui/icons-material/PieChart'
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
import Button from '@mui/material/Button'
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

const ContactUs = () => {
  const { user } = useAuth(false)
  const router = useRouter()

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
              <b>Contact Us</b>
            </Typography>
            <Typography component="h1" variant="subtitle1">
              If you have any questions, comments, or concerns, the best way to
              contact any of us is through our emails below:
            </Typography>
            <Paper
              variant="elevation"
              elevation={2}
              sx={{ my: { xs: 1, md: 1 }, p: { xs: 1, md: 1 }, width: '100%' }}
            >
              <Typography component="h1" variant="subtitle1">
                <b>Jacob Zhang:</b> zhan4011@purdue.edu
              </Typography>
            </Paper>
            <Paper
              variant="elevation"
              elevation={2}
              sx={{ my: { xs: 1, md: 1 }, p: { xs: 1, md: 1 }, width: '100%' }}
            >
              <Typography component="h1" variant="subtitle1">
                <b>Vincent Vu:</b> vvvu@purdue.edu
              </Typography>
            </Paper>
            <Paper
              variant="elevation"
              elevation={2}
              sx={{ my: { xs: 1, md: 1 }, p: { xs: 1, md: 1 }, width: '100%' }}
            >
              <Typography component="h1" variant="subtitle1">
                <b>Ryan Chu:</b> chu193@purdue.edu
              </Typography>
            </Paper>
            <Paper
              variant="elevation"
              elevation={2}
              sx={{ my: { xs: 1, md: 1 }, p: { xs: 1, md: 1 }, width: '100%' }}
            >
              <Typography component="h1" variant="subtitle1">
                <b>Kevin Chi:</b> chi55@purdue.edu
              </Typography>
            </Paper>
            <Paper
              variant="elevation"
              elevation={2}
              sx={{ my: { xs: 1, md: 1 }, p: { xs: 1, md: 1 }, width: '100%' }}
            >
              <Typography component="h1" variant="subtitle1">
                <b>Evan Yang:</b> yang1944@purdue.edu
              </Typography>
            </Paper>
            <Paper
              variant="elevation"
              elevation={2}
              sx={{ my: { xs: 1, md: 1 }, p: { xs: 1, md: 1 }, width: '100%' }}
            >
              <Typography component="h1" variant="subtitle1">
                <b>James Corder:</b> corderj@purdue.edu
              </Typography>
            </Paper>
            <Typography component="h1" variant="subtitle1" align="center">
              Or you can submit your concerns through the discord server below:
            </Typography>
            <Button
              href="https://discord.gg/A2NF4FsgwF"
              onClick={(e) => {
                e.preventDefault()
                router.push('https://discord.gg/A2NF4FsgwF')
              }}
              style={{
                color: 'inherit',
              }}
            >
              <PieChartIcon sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                color="#738adb"
                noWrap
                letterSpacing=".1rem"
              >
                LifeLogistics Discord
              </Typography>
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export default ContactUs

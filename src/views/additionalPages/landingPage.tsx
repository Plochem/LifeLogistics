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
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
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

const LandingPage = () => {
  const { user } = useAuth(false)
  const router = useRouter()

  return (
    <>
      <Navbar user={user} />
      <Container component="main" maxWidth="lg">
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
              Welcome to <b>LifeLogistics</b>
            </Typography>
          </Box>
          <Paper
            variant="elevation"
            elevation={6}
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
                Mission Statement
              </Typography>
              <Typography component="h1" variant="h6">
                &quot;Social Life All In One Place&quot;
              </Typography>
            </Box>
            <Paper
              variant="elevation"
              elevation={2}
              sx={{ my: { xs: 1, md: 1 }, p: { xs: 1, md: 1 } }}
            >
              <img
                src="https://blog.drupa.com/wp-content/uploads/2015/11/Calendar-1000x605.jpg"
                width="100%"
                height="100%"
              />
            </Paper>
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h5" variant="subtitle1">
                LifeLogistics seeks to bring all of your events into one place
                where you can share and collaborate with friends.
              </Typography>
            </Box>
          </Paper>
          <Paper
            variant="elevation"
            elevation={6}
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
                Features
              </Typography>
              <Typography component="h1" variant="subtitle1">
                Some of our Features include:
              </Typography>
            </Box>
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'left',
              }}
            >
              <List>
                <ListItem
                  sx={{
                    padding: 0,
                    textAlign: 'left',
                    listStyleType: 'disc',
                    display: 'list-item',
                  }}
                >
                  <ListItemText primary="Public Profiles" />
                </ListItem>
                <ListItem
                  sx={{
                    padding: 0,
                    textAlign: 'left',
                    listStyleType: 'disc',
                    display: 'list-item',
                  }}
                >
                  <ListItemText primary="Private Profiles" />
                </ListItem>
                <ListItem
                  sx={{
                    padding: 0,
                    textAlign: 'left',
                    listStyleType: 'disc',
                    display: 'list-item',
                  }}
                >
                  <ListItemText primary="Profile Editing" />
                </ListItem>
                <ListItem
                  sx={{
                    padding: 0,
                    textAlign: 'left',
                    listStyleType: 'disc',
                    display: 'list-item',
                  }}
                >
                  <ListItemText primary="Public Calendars" />
                </ListItem>
                <ListItem
                  sx={{
                    padding: 0,
                    textAlign: 'left',
                    listStyleType: 'disc',
                    display: 'list-item',
                  }}
                >
                  <ListItemText primary="Private Calendars" />
                </ListItem>
                <ListItem
                  sx={{
                    padding: 0,
                    textAlign: 'left',
                    listStyleType: 'disc',
                    display: 'list-item',
                  }}
                >
                  <ListItemText primary="Group Calendars" />
                </ListItem>
                <ListItem
                  sx={{
                    padding: 0,
                    textAlign: 'left',
                    listStyleType: 'disc',
                    display: 'list-item',
                  }}
                >
                  <ListItemText primary="Calendar Importing" />
                </ListItem>
              </List>
            </Box>
          </Paper>
        </Paper>
      </Container>
    </>
  )
}

export default LandingPage

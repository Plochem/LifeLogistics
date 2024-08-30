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
import Grid from '@mui/material/Grid'
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

const AboutUs = () => {
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
              <b>About Us</b>
            </Typography>
          </Box>
          <Grid spacing={5} sx={{ my: 3, px: 3 }}>
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Paper
                variant="elevation"
                elevation={2}
                sx={{ my: { xs: 4, md: 6 }, p: { xs: 4, md: 4 } }}
              >
                <Typography component="h1" variant="h4">
                  Developers
                </Typography>
                <List>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText primary="Jacob Zhang" />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText primary="Vincent Vu" />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText primary="Evan Yang" />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText primary="Ryan Chu" />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText primary="Kevin Chi" />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText primary="James Corder" />
                  </ListItem>
                </List>
              </Paper>
              <Paper
                variant="elevation"
                elevation={2}
                sx={{ my: { xs: 4, md: 6 }, p: { xs: 4, md: 4 } }}
              >
                <Typography component="h1" variant="h4" align="center">
                  Problems and Solutions
                </Typography>
                <List>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText
                      primary="Lack of Unified Calendar Space"
                      secondary="Introduction of a Main Calendar which can show any number of calendars"
                    />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText
                      primary="Inability to Plan Events with Friends"
                      secondary="Creation of Group Calendars to share events with friends and plan accordingly"
                    />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText
                      primary="Clarity Across Calendars"
                      secondary="Color coordinated calendars who's visibilty can be toggled"
                    />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText
                      primary="Access to External Calendars"
                      secondary="Ability to import and export any calendar of the correct file type"
                    />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText
                      primary="Inconvienent Event Management"
                      secondary="Ability to add and remove events from calendar and isolate events to specific calendars"
                    />
                  </ListItem>
                  <ListItem
                    sx={{
                      padding: 0,
                      textAlign: 'center',
                      listStyleType: 'disc',
                    }}
                  >
                    <ListItemText
                      primary="Cluttered Calendars"
                      secondary="Ability to create multiple calendars for specific things and toggle their visibility on the Main Calendar or view individually"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Grid>
        </Paper>
      </Container>
    </>
  )
}

export default AboutUs

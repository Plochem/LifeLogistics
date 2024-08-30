/* eslint-disable no-nested-ternary */

import { SearchSharp } from '@mui/icons-material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import { LoadingButton } from '@mui/lab'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
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
import to from 'await-to-js'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import DefaultLoadingView from '@/components/Loading/Default'
import Navbar from '@/components/Navbar'
import TOAST_CONFIG from '@/constants/toastconfig'
import useAuth from '@/hooks/useAuth'

import type { User } from 'next-auth'

// Actual Page Displayed based on user logged in
const PublicSearch = () => {
  // This is the user that is logged in
  const { user } = useAuth()
  const router = useRouter()
  const [searchType, setSearchType] = useState('Username')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [results, setResults] = useState([] as IUser[])
  const [calendars, setCalendars] = useState([] as ICalendar[])
  const [tags, setTags] = useState([] as ICalendar[])
  const [events, setEvents] = useState([] as IEvent[])
  const [exactMatch, setExactMatch] = useState(false)

  const handleSearch = async () => {
    if (searchQuery === '') {
      // No Query, return no results
      setResults([])
      setEvents([])
      setCalendars([])
      setTags([])
    } else if (searchType === 'Username') {
      // Searching by Username
      const [error, res] = await to(
        axios.get(`/api/user/${searchQuery}?exact=false&page=1&pageSize=25`)
      )
      if (error || !res) {
        toast.error('An error has occurred!', TOAST_CONFIG)
      } else {
        setResults(res.data.users)
      }
      // Set the other 3 options to empty
      setCalendars([])
      setEvents([])
      setTags([])
    } else if (searchType === 'Calendar') {
      // Searching by Calendar Name
      const [error, res] = await to(
        axios.get(`/api/calendar?name=${searchQuery}`)
      )
      if (error || !res) {
        toast.error('An error has occurred!', TOAST_CONFIG)
      } else {
        setCalendars(res.data.calendars)
      }
      // Set the other 3 options to empty
      setResults([])
      setEvents([])
      setTags([])
    } else if (searchType === 'Tag') {
      // TODO: Implement Tag Search Logic: NEED TO WAIT FOR EVAN PR TO TEST
      const [error, res] = await to(
        axios.get(`/api/calendar?tag=${searchQuery}`)
      )
      if (error || !res) {
        toast.error('An error has occurred!', TOAST_CONFIG)
      } else {
        setTags(res.data.calendars)
      }
      setResults([])
      setEvents([])
      setCalendars([])
    } else if (searchType === 'Event') {
      // TODO: Implement Event Search Logic: NEED TO WAIT FOR EVAN PR TO TEST
      const [error, res] = await to(
        axios.get(`/api/event?title=${searchQuery}`)
      )
      if (error || !res) {
        toast.error('An error has occurred!', TOAST_CONFIG)
      } else {
        setEvents(res.data.events)
      }
      // Set the other 3 options to empty
      setResults([])
      setCalendars([])
      setTags([])
    } else {
      // Not valid, set all arrays to empty
      // Set all results to empty to display no results
      setResults([])
      setEvents([])
      setCalendars([])
      setTags([])
    }
  }
  return (
    <>
      <Navbar user={user} />
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          mt: 12,
          mb: 5,
          alignItems: 'center',
          textAlign: 'center',
          verticalAlign: 'middle',
        }}
      >
        <Paper
          variant="elevation"
          elevation={8}
          sx={{
            my: { xs: 3, md: 6 },
            p: { xs: 2, md: 3 },
            alignItems: 'center',
            textAlign: 'center',
            verticalAlign: 'middle',
          }}
        >
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Stack spacing={0.5} direction="row">
              <TextField
                id="search-bar"
                variant="outlined"
                label="Search"
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { lg: '600px', md: '400px', xs: '150px' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl>
                <InputLabel id="type-of-search" />
                <Select
                  labelId="select-category"
                  id="category"
                  sx={{ width: { lg: '200px', md: '100px', xs: '100px' } }}
                  defaultValue={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value)
                  }}
                >
                  <MenuItem value="Username">Username</MenuItem>
                  <MenuItem value="Calendar">Calendar</MenuItem>
                  <MenuItem value="Tag">Tag</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
          {results.length === 0 &&
          calendars.length === 0 &&
          tags.length === 0 &&
          events.length === 0 ? (
            <Typography>No Results</Typography>
          ) : searchType === 'Username' ? (
            <Stack
              spacing={0.2}
              sx={{
                alignItems: 'left',
                textAlign: 'left',
                verticalAlign: 'middle',
              }}
            >
              {results.map((value, index) => (
                <Button
                  key={value.username}
                  onClick={() => router.push(`/user/${value.username}`)}
                >
                  <Paper
                    variant="elevation"
                    elevation={2}
                    sx={{
                      width: { lg: '500px', md: '250px', xs: '250px' },
                      height: '50px',
                      alignItems: 'left',
                      textAlign: 'left',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Stack direction="row">
                      <Typography
                        component="h1"
                        variant="subtitle1"
                        textAlign="center"
                        sx={{
                          width: { lg: '500px', md: '250px', xs: '250px' },
                          height: '50px',
                          alignItems: 'center',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {value.name}
                      </Typography>
                      <Typography
                        component="h1"
                        variant="subtitle2"
                        textAlign="center"
                        sx={{
                          width: { lg: '500px', md: '250px', xs: '250px' },
                          height: '50px',
                          alignItems: 'center',
                          textAlign: 'center',
                          verticalAlign: 'bottom',
                        }}
                      >
                        @{value.username}
                      </Typography>
                    </Stack>
                  </Paper>
                </Button>
              ))}
            </Stack>
          ) : searchType === 'Calendar' ? (
            <Stack spacing={0.2}>
              {calendars.map((value, index) => (
                <Button
                  key={value._id}
                  onClick={() => router.push(`/calendar/${value._id}`)}
                >
                  <Paper
                    variant="elevation"
                    elevation={2}
                    sx={{
                      width: { lg: '500px', md: '250px', xs: '200px' },
                      height: '50px',
                      alignItems: 'left',
                      textAlign: 'left',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Stack direction="row">
                      <Typography
                        component="h1"
                        variant="h4"
                        textAlign="center"
                        sx={{
                          width: { lg: '500px', md: '250px', xs: '200px' },
                          height: '50px',
                          alignItems: 'center',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                        color={value.color}
                      >
                        {value.name}
                      </Typography>
                    </Stack>
                  </Paper>
                </Button>
              ))}
            </Stack>
          ) : searchType === 'Tag' ? (
            <Stack spacing={0.2}>
              {tags.map((value, index) => (
                <Button
                  key={value._id}
                  onClick={() => router.push(`/calendar/${value._id}`)}
                >
                  <Paper
                    variant="elevation"
                    elevation={2}
                    sx={{
                      width: { lg: '500px', md: '250px', xs: '200px' },
                      height: '50px',
                      alignItems: 'left',
                      textAlign: 'left',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Stack direction="row">
                      <Typography
                        component="h1"
                        variant="h4"
                        textAlign="center"
                        sx={{
                          width: { lg: '500px', md: '250px', xs: '200px' },
                          height: '50px',
                          alignItems: 'center',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                        color={value.color}
                      >
                        {value.name}
                      </Typography>
                    </Stack>
                  </Paper>
                </Button>
              ))}
            </Stack>
          ) : searchType === 'Event' ? (
            <Stack spacing={0.2}>
              {events.map((value, index) => (
                <Button
                  key={value._id}
                  onClick={() => router.push(`/calendar/${value.calendar}`)}
                >
                  <Paper
                    variant="elevation"
                    elevation={2}
                    sx={{
                      width: { lg: '500px', md: '250px', xs: '200px' },
                      height: '50px',
                      alignItems: 'left',
                      textAlign: 'left',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Stack direction="row">
                      <Typography
                        component="h1"
                        variant="subtitle1"
                        textAlign="center"
                        sx={{
                          width: { lg: '500px', md: '250px', xs: '250px' },
                          height: '50px',
                          alignItems: 'center',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {value.title}
                      </Typography>
                      <Typography
                        component="h1"
                        variant="subtitle2"
                        textAlign="center"
                        sx={{
                          width: { lg: '500px', md: '250px', xs: '250px' },
                          height: '50px',
                          alignItems: 'center',
                          textAlign: 'center',
                          verticalAlign: 'bottom',
                        }}
                      >
                        {value.description}
                      </Typography>
                    </Stack>
                  </Paper>
                </Button>
              ))}
            </Stack>
          ) : (
            <Typography>No Results</Typography>
          )}
        </Paper>
      </Container>
    </>
  )
}

export default PublicSearch

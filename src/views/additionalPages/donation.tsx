/* eslint-disable import/no-extraneous-dependencies */
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PieChartIcon from '@mui/icons-material/PieChart'
import { LoadingButton } from '@mui/lab'
import {
  Button,
  ButtonGroup,
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

const DonationPage = () => {
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
              <b>Donations</b>
            </Typography>
            <Typography component="h1" variant="subtitle1">
              Although Donations are not necessary, it does help support
              development and show apprecation!
            </Typography>
            <ButtonGroup
              orientation="vertical"
              aria-aria-label="vertical outlined button group"
            >
              <Button
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/')
                }}
                style={{
                  color: 'inherit',
                }}
              >
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  color="#008cff"
                  noWrap
                  letterSpacing=".1rem"
                >
                  Jacob Zhang
                </Typography>
              </Button>
              <Button
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/')
                }}
                style={{
                  color: 'inherit',
                }}
              >
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  color="#008cff"
                  noWrap
                  letterSpacing=".1rem"
                >
                  Vincent Vu
                </Typography>
              </Button>
              <Button
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/')
                }}
                style={{
                  color: 'inherit',
                }}
              >
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  color="#008cff"
                  noWrap
                  letterSpacing=".1rem"
                >
                  Evan Yang
                </Typography>
              </Button>
              <Button
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/')
                }}
                style={{
                  color: 'inherit',
                }}
              >
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  color="#008cff"
                  noWrap
                  letterSpacing=".1rem"
                >
                  Kevin Chi
                </Typography>
              </Button>
              <Button
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/')
                }}
                style={{
                  color: 'inherit',
                }}
              >
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  color="#008cff"
                  noWrap
                  letterSpacing=".1rem"
                >
                  Ryan Chu
                </Typography>
              </Button>
              <Button
                href="https://account.venmo.com/u/JamesCorder"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('https://account.venmo.com/u/JamesCorder')
                }}
                style={{
                  color: 'inherit',
                }}
              >
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  color="#008cff"
                  noWrap
                  letterSpacing=".1rem"
                >
                  James Corder
                </Typography>
              </Button>
            </ButtonGroup>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export default DonationPage

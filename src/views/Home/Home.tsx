import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import DefaultLoadingView from '@/components/Loading/Default'
import Navbar from '@/components/Navbar'
import useAuth from '@/hooks/useAuth'
import useRedirect from '@/hooks/useRedirect'

const Home = () => {
  const { redirect } = useRedirect()

  // pass false to prevent protecting this page
  // i.e. user needs to be signed in to view this page
  const { status, user } = useAuth(false)

  if (status === 'loading' || (status === 'authenticated' && !user))
    return <DefaultLoadingView />

  return (
    <>
      <Navbar user={user} />
      <Stack
        textAlign="center"
        height="70vh"
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 10 }}
      >
        <Typography variant="h3" sx={{ mb: 4 }}>
          LifeLogistics
        </Typography>
        <Button variant="contained" onClick={() => redirect('/dashboard')}>
          {user ? 'Go to Dashboard' : 'Login'}
        </Button>
      </Stack>
      <Container component="main" maxWidth="lg">
        <Paper
          variant="elevation"
          elevation={8}
          sx={{ my: { xs: 4, md: 6 }, p: { xs: 4, md: 4 } }}
        >
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

export default Home

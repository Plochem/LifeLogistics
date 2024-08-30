import { Box, Container, Paper, Typography } from '@mui/material'

import Navbar from '@/components/Navbar'
import useAuth from '@/hooks/useAuth'

const FourNotFourPage = () => {
  const { user } = useAuth(false)

  return (
    <>
      <Navbar user={user} />
      <Container component="main" sx={{ mt: 10 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h3">
              {' '}
              Error 404: Page Not Found
            </Typography>
            <Typography> The Page you requested does not exist.</Typography>
          </Box>
        </Paper>
      </Container>
    </>
  )
}
export default FourNotFourPage

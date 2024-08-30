import { Box, CircularProgress } from '@mui/material'

const DefaultLoadingView = () => (
  // could potentially add nav bar too
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}
  >
    <CircularProgress />
  </Box>
)

export default DefaultLoadingView

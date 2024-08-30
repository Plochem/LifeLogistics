import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { getProviders, signIn } from 'next-auth/react'

import Navbar from '@/components/Navbar'
import useAuth from '@/hooks/useAuth'

import type { Provider } from 'next-auth/providers'

// https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/core/pages/signin.tsx

type Props = {
  providers: Provider
}

const DEFAULT_CALLBACK = '/dashboard'

const SignIn = ({ providers }: Props) => {
  const router = useRouter()
  const { query } = router
  const { user } = useAuth(false)

  return (
    <>
      <Navbar user={user} />
      <Box
        sx={{
          width: '90vw',
          maxWidth: '500px',
          position: 'absolute',
          left: '50%',
          top: { xs: '48%', sm: '45%' },
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Typography
            sx={{
              fontSize: '50px',
              textAlign: 'center',
            }}
          >
            Log In
          </Typography>

          {query?.error === 'OAuthAccountNotLinked' && (
            <Typography sx={{ color: '#d81b60' }}>
              Account with email already exists!
            </Typography>
          )}

          <Stack spacing={3} alignItems="center">
            {Object.values(providers).map((provider) => (
              <Box key={provider.name}>
                <Button
                  variant="contained"
                  onClick={() =>
                    signIn(provider.id, {
                      callbackUrl:
                        (query?.redirect as string) || DEFAULT_CALLBACK,
                    })
                  }
                  type="button"
                >
                  {provider.name}
                </Button>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    </>
  )
}

export default SignIn

export async function getServerSideProps() {
  const providers = await getProviders()

  return {
    props: { providers },
  }
}

import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import * as React from 'react'
import { ToastContainer } from 'react-toastify'

import { darkTheme, lightTheme } from '@/styles/theme'
import createEmotionCache from '@/utils/createEmotionCache'
import ThemeModeContext from '@/utils/themeMode'

import type { EmotionCache } from '@emotion/react'
import type { AppProps } from 'next/app'

import 'react-toastify/dist/ReactToastify.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

// eslint-disable-next-line react/function-component-definition
export default function App(props: AppProps & { emotionCache?: EmotionCache }) {
  const {
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps: { session, ...pageProps },
  } = props

  // https://mui.com/material-ui/customization/dark-mode/#toggling-color-mode
  const [mode, setMode] = React.useState<'light' | 'dark'>('light')
  const themeMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
    }),
    []
  )

  const theme = React.useMemo(
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode]
  )

  return (
    <SessionProvider session={session}>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <ThemeModeContext.Provider value={themeMode}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <Component {...pageProps} />
              <ToastContainer />
            </ThemeProvider>
          </LocalizationProvider>
        </ThemeModeContext.Provider>
      </CacheProvider>
    </SessionProvider>
  )
}

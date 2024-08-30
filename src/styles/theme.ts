import { red } from '@mui/material/colors'
import { Theme, createTheme } from '@mui/material/styles'
// import { Roboto } from '@next/font/google'

// export const roboto = Roboto({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['Helvetica', 'Arial', 'sans-serif'],
// })

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
  // typography: {
  //   fontFamily: roboto.style.fontFamily,
  // },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a0aad6',
    },
    secondary: {
      main: '#86b7b2',
    },
    error: {
      main: red.A400,
    },
  },

  // typography: {
  //   fontFamily: roboto.style.fontFamily,
  // },
})

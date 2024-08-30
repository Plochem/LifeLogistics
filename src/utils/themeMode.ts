// https://mui.com/material-ui/customization/dark-mode/#toggling-color-mode
import { createContext } from 'react'

const ThemeModeContext = createContext({ toggleColorMode: () => {} })

export default ThemeModeContext

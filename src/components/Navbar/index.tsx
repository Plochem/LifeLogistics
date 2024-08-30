import {
  Brightness4,
  Brightness7,
  CalendarMonth,
  CalendarToday,
  ExpandLess,
  Home,
  Login,
  Logout,
  PushPin,
  Settings,
} from '@mui/icons-material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import PieChartIcon from '@mui/icons-material/PieChart'
import SearchIcon from '@mui/icons-material/Search'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import { useContext, useMemo, useState } from 'react'

import InboxPopover from '@/components/InboxPopover'
import useRedirect from '@/hooks/useRedirect'
import ThemeModeContext from '@/utils/themeMode'

import type { MouseEventHandler } from 'react'

type NavbarProps = {
  user?: IUser
  plain?: boolean
}

// TODO could potentially make this part of a nextjs page layout, but eh
const Navbar = ({ user, plain = false }: NavbarProps) => {
  const router = useRouter()
  const theme = useTheme()
  const { redirect } = useRedirect()
  const { toggleColorMode } = useContext(ThemeModeContext)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [calAnchorEl, setCalAnchorEl2] = useState<HTMLElement | null>(null)
  const menuOpen = Boolean(anchorEl)
  const calMenuOpen = Boolean(calAnchorEl)

  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const handleCalClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setCalAnchorEl2(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCalClose = () => {
    setCalAnchorEl2(null)
  }

  const handleLogout = () => {
    signOut()
  }

  const sortedCalendars = useMemo(
    () =>
      (user?.calendars || []).sort((a: ICalendar, b: ICalendar) => {
        if (
          user?.pinnedCalendars.find((e) => e._id === a._id) &&
          user?.pinnedCalendars.find((e) => e._id === b._id) &&
          a.name > b.name
        ) {
          return 1
        }
        if (
          user?.pinnedCalendars.find((e) => e._id === a._id) &&
          user?.pinnedCalendars.find((e) => e._id === b._id) &&
          a.name > b.name
        ) {
          return -1
        }
        if (
          user?.pinnedCalendars.find((e) => e._id === a._id) &&
          !user?.pinnedCalendars.find((e) => e._id === b._id)
        )
          return -1
        if (
          user?.pinnedCalendars.find((e) => e._id === b._id) &&
          !user?.pinnedCalendars.find((e) => e._id === a._id)
        )
          return 1
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      }),
    [user]
  )

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'dark' ? '#282828' : '#f5f5f5',
        }}
      >
        <Toolbar>
          {!plain && (
            <IconButton
              sx={{
                display: {
                  md: 'none',
                  xs: 'inline-flex',
                },
              }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Button
            href={plain ? undefined : '/dashboard'}
            onClick={
              plain
                ? undefined
                : (e) => {
                    e.preventDefault()
                    router.push('/dashboard')
                  }
            }
            sx={{
              color: 'inherit',
              display: {
                md: 'flex',
                xs: plain ? 'flex' : 'none',
              },
            }}
          >
            <PieChartIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              color="inherit"
              noWrap
              letterSpacing=".1rem"
            >
              LifeLogistics
            </Typography>
          </Button>
          {user && !plain && (
            <IconButton
              href="/search"
              onClick={(e) => {
                e.preventDefault()
                router.push('/search')
              }}
            >
              <SearchIcon />
            </IconButton>
          )}
          {/* right separator */}
          <Box ml="auto" />
          {!user && !plain && (
            <Stack
              direction="row"
              gap={1}
              sx={{ display: { md: 'flex', xs: 'none' } }}
            >
              <Button
                variant="text"
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/')
                }}
                style={{
                  color: 'inherit',
                  backgroundColor:
                    router.pathname === '/' ? '#b6d0fc' : 'default',
                }}
              >
                <Typography textTransform="initial">Home</Typography>
              </Button>
              <Button
                variant="text"
                href="/about-us"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/about-us')
                }}
                style={{
                  color: 'inherit',
                  backgroundColor:
                    router.pathname === '/about-us' ? '#b6d0fc' : 'default',
                }}
              >
                <Typography textTransform="initial">About</Typography>
              </Button>
              <Button
                variant="text"
                href="/contact-us"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/contact-us')
                }}
                style={{
                  color: 'inherit',
                  backgroundColor:
                    router.pathname === '/contact-us' ? '#b6d0fc' : 'default',
                }}
              >
                <Typography textTransform="initial">Contact Us</Typography>
              </Button>
              <Button
                variant="text"
                href="/donate"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/donate')
                }}
                style={{
                  color: 'inherit',
                  backgroundColor:
                    router.pathname === '/donate' ? '#b6d0fc' : 'default',
                }}
              >
                <Typography textTransform="initial">Donations</Typography>
              </Button>
              <Button
                variant="text"
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/privacy')
                }}
                style={{
                  color: 'inherit',
                  backgroundColor:
                    router.pathname === '/privacy' ? '#b6d0fc' : 'default',
                }}
              >
                <Typography textTransform="initial">Privacy</Typography>
              </Button>
            </Stack>
          )}
          {user && !plain && (
            <>
              <InboxPopover user={user} />

              <Button
                variant="text"
                href="/calendar/main"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/calendar/main')
                }}
                sx={{
                  display: {
                    md: 'flex',
                    xs: 'none',
                  },
                }}
              >
                <Typography textTransform="initial" fontWeight="normal">
                  Main Calendar
                </Typography>
              </Button>
              <Button
                variant="text"
                onClick={handleCalClick}
                sx={{
                  display: {
                    md: 'flex',
                    xs: 'none',
                  },
                }}
              >
                {calMenuOpen ? <ExpandLess /> : <ExpandMoreIcon />}
                <Typography textTransform="initial" fontWeight="normal">
                  My Calendars
                </Typography>
              </Button>

              <Menu
                open={calMenuOpen}
                anchorEl={calAnchorEl}
                onClose={handleCalClose}
                onClick={handleCalClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {sortedCalendars.map((calendar) => (
                  <MenuItem
                    key={calendar._id}
                    disabled={calendar._id === (router.query.id as string)}
                  >
                    <Link
                      href={`/calendar/${calendar._id as string}`}
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/calendar/${calendar._id as string}`)
                      }}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ListItemIcon>
                        {user?.pinnedCalendars.find(
                          (e) => e._id === calendar._id
                        ) ? (
                          <PushPin />
                        ) : (
                          <CalendarToday />
                        )}
                      </ListItemIcon>
                      {calendar.name}
                    </Link>
                  </MenuItem>
                ))}

                <MenuItem>
                  <Link
                    href="/calendar/create"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/calendar/create`)
                    }}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ListItemIcon>
                      <AddCircleIcon />
                    </ListItemIcon>
                    Create
                  </Link>
                </MenuItem>
              </Menu>

              <Button
                variant="text"
                onClick={handleClick}
                sx={{
                  display: {
                    md: 'flex',
                    xs: 'none',
                  },
                }}
              >
                {menuOpen ? <ExpandLess /> : <ExpandMoreIcon />}
                <Typography textTransform="initial" fontWeight="normal">
                  {user?.username ?? ''}
                </Typography>
                <Avatar src={user?.image ?? ''} sx={{ mx: 1 }} />
              </Button>

              <IconButton
                onClick={() => router.push('/calendar/main')}
                sx={{
                  display: {
                    md: 'none',
                    xs: 'inline-flex',
                  },
                }}
              >
                <CalendarMonth />
              </IconButton>
              <IconButton
                onClick={handleCalClick}
                sx={{
                  display: {
                    md: 'none',
                    xs: 'inline-flex',
                  },
                }}
              >
                <CalendarToday />
              </IconButton>
              <IconButton
                onClick={() => router.push('/user')}
                sx={{
                  display: {
                    md: 'none',
                    xs: 'inline-flex',
                  },
                }}
              >
                <Avatar src={user?.image ?? ''} />
              </IconButton>

              <Menu
                open={menuOpen}
                anchorEl={anchorEl}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleClose}>
                  <Link
                    href="/user"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    My Profile
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Link
                    href="/user/edit"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    Settings
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
          {!user && !plain && (
            <Button
              href="/user"
              onClick={(e) => {
                e.preventDefault()
                redirect('/user')
              }}
              variant="outlined"
              startIcon={<Login />}
              sx={{ mx: 2 }}
            >
              Login
            </Button>
          )}
          <Tooltip title="Change theme">
            <IconButton onClick={toggleColorMode}>
              {theme.palette.mode === 'light' ? (
                <Brightness4 />
              ) : (
                <Brightness7 />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ height: '100%' }}>
          <ListItem>
            <PieChartIcon sx={{ mr: 1 }} />
            <Typography color="inherit" noWrap letterSpacing=".1rem">
              LIFELOGISTICS
            </Typography>
          </ListItem>
          <Divider />
          {user && (
            <>
              <ListItem sx={{ mt: 2, mb: 1 }}>
                <Stack
                  alignItems="center"
                  sx={{
                    width: '100%',
                  }}
                >
                  <Avatar
                    src={user?.image ?? ''}
                    sx={{ width: 70, height: 70 }}
                  />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    @{user?.username ?? ''}
                  </Typography>
                </Stack>
              </ListItem>
              <Divider />
            </>
          )}

          {user && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/user')}
                  selected={router.pathname === '/user'}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/user/edit')}
                  selected={router.pathname === '/user/edit'}
                >
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </ListItem>
              <Divider />
            </>
          )}

          {!user && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/')}
                  selected={router.pathname === '/'}
                >
                  <ListItemIcon>
                    <Home />
                  </ListItemIcon>
                  <ListItemText primary="Home" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/about-us')}
                  selected={router.pathname === '/about-us'}
                >
                  <ListItemText primary="About" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/contact-us')}
                  selected={router.pathname === '/contact-us'}
                >
                  <ListItemText primary="Contact Us" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/donate')}
                  selected={router.pathname === '/donate'}
                >
                  <ListItemText primary="Donations" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/privacy')}
                  selected={router.pathname === '/privacy'}
                >
                  <ListItemText primary="Privacy" />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {user && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/dashboard')}
                  selected={router.pathname === '/dashboard'}
                >
                  <ListItemIcon>
                    <Home />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/calendar/main')}
                  selected={router.pathname === '/calendar/main'}
                >
                  <ListItemIcon>
                    <CalendarMonth />
                  </ListItemIcon>
                  <ListItemText primary="Main Calendar" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
        {user && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton color="error" onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>
                  <Typography color="error">Logout</Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </>
        )}
        {!user && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => redirect('/user')}
                selected={router.pathname === '/auth/signin'}
              >
                <ListItemIcon>
                  <Login />
                </ListItemIcon>
                <ListItemText>
                  <Typography>Login</Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </>
        )}
      </Drawer>
    </>
  )
}

export default Navbar

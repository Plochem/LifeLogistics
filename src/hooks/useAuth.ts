import axios from 'axios'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo } from 'react'
import useSWR from 'swr'

import type { AxiosError } from 'axios'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const useAuth = (protectPage: boolean = true) => {
  const { status, data: session } = useSession()
  const router = useRouter()

  const { data, error, isValidating, mutate } = useSWR<
    { user: IUser },
    AxiosError
  >(() => (session?.user ? `/api/user` : null), fetcher, {
    revalidateOnFocus: false,
  })

  const user = useMemo(() => data?.user, [data])

  useEffect(() => {
    if (isValidating || !protectPage) return

    if (status === 'unauthenticated') {
      router.push({
        pathname: '/auth/signin',
        query: {
          redirect: router.asPath,
        },
      })
    } else if (status === 'authenticated' && user) {
      // redirect user to create a username if does not alr have one
      // will only be undefined once (after user is authenticated)
      // ain't perfect but it's honest work (ideally shud do this on serverside but o well)
      if (!user.username && router.pathname !== '/user/create-username') {
        router.push({
          pathname: '/user/create-username',
          query: {
            redirect: (router.query.redirect as string) ?? router.pathname,
          },
        })
      }
    }
  }, [status, isValidating, protectPage, user])

  return {
    status: isValidating ? 'loading' : status,
    session,
    user,
    error,
    mutate,
  }
}

export default useAuth

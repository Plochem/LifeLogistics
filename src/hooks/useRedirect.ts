import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

const useRedirect = () => {
  const { status } = useSession()
  const router = useRouter()

  /**
   * Goes to /signin page and then upon signing in, will redirect to value of redirectUrl
   */
  const redirect = useCallback(
    (redirectUrl?: string) => {
      if (status === 'unauthenticated')
        router.push({
          pathname: '/auth/signin',
          query: {
            redirect: redirectUrl || router.asPath,
          },
        })
      else if (status === 'authenticated')
        router.push(redirectUrl || router.asPath)
    },
    [status]
  )

  return { redirect }
}

export default useRedirect

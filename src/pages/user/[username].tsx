import { useRouter } from 'next/router'

import AccountProfile from '@/views/accountInfo/AccountProfile'

import type { NextPage } from 'next'

const UserPage: NextPage = () => {
  const router = useRouter()
  const username = router.query.username as string
  return <AccountProfile username={username} />
}

export default UserPage

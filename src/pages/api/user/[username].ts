import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { getCalendarsByOwner } from '@/controllers/calendar'
import {
  getUserByUsername,
  getUsersByUsername,
  removeExpiredEventInviteFromUser,
} from '@/controllers/user'
import dbConnect from '@/utils/store/dbConnect'

import type { NextApiRequest, NextApiResponse } from 'next'

const getUserRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect()

  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { username, exact = 'true', pageSize = 10, page = 1 } = req.query || {}

  const usernameStr: string = String(username)
  const pageSizeNum: number = Number(pageSize)
  const pageNum: number = Number(page)

  await to(removeExpiredEventInviteFromUser(token.id))

  if (exact === 'true') {
    const [error, user] = await to(
      getUserByUsername({ username: username as string })
    )

    if (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
    }
    if (!user || user.visibility === false) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: ReasonPhrases.NOT_FOUND })
    }

    const [err, userWithCalendars] = await to(
      getCalendarsByOwner(user._id, token.id)
    )

    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
    }
    return res.status(StatusCodes.ACCEPTED).send({ users: [userWithCalendars] })
  }

  const [err, userObjects] = await to(
    getUsersByUsername({
      username: usernameStr,
      page: pageNum,
      pageSize: pageSizeNum,
    })
  )

  if (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.json({ users: userObjects, page: pageNum, pageSize: pageSizeNum })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getUserRequest(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

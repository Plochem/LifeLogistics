import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { followCalendar, getUser } from '@/controllers/user'
import dbConnect from '@/utils/store/dbConnect'

import type { NextApiRequest, NextApiResponse } from 'next'

const followCal = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect()
  const token = await getToken({ req })

  const { id } = req.query

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  if (!req.body) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const { unfollow = false } = req.body

  const [errUser] = await to(getUser(token.id, { lean: true }))

  if (errUser)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: errUser.message })

  const [errFollow, user] = await to(
    followCalendar(token.id, <string>id, unfollow)
  )

  if (errFollow)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: errFollow.message })

  return res.send({ message: 'OK', user })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await followCal(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

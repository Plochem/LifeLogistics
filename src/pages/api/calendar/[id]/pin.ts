import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { pinCalendar } from '@/controllers/calendar'
import { getUser } from '@/controllers/user'
import dbConnect from '@/utils/store/dbConnect'

import type { NextApiRequest, NextApiResponse } from 'next'

const pinCal = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const { pinStatus } = req.body

  const [errUser, user] = await to(getUser(token.id, { lean: true }))

  if (errUser)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: errUser.message })

  if (
    user?.calendars.length &&
    !user.calendars.some(({ _id }) => _id.toString() === id) &&
    !(user.followedCalendars || []).some(({ _id }) => _id.toString() === id)
  ) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send({ message: 'Invalid calendar' })
  }

  const [errPin] = await to(pinCalendar(token.id, <string>id, pinStatus))

  if (errPin)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: errPin.message })

  return res.send({ message: 'OK' })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await pinCal(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

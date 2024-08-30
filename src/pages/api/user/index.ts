import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { getCalendarsByOwner as getUserWithCalendars } from '@/controllers/calendar'
import { getEventsByCalendar } from '@/controllers/event'
import {
  getUser,
  getUserByUsername,
  removeExpiredEventInviteFromUser,
  updateUser,
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

  await to(removeExpiredEventInviteFromUser(token.id))

  const [err, userWithCalendars] = await to(
    getUserWithCalendars(token.id, token.id)
  )
  if (err || !userWithCalendars) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  // i forget why we do this, refactor later
  return res.send({
    user: {
      ...userWithCalendars.toObject(),
      id: userWithCalendars._id.toString(),
    },
  })
}

const patchUserRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect()

  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { payload }: { payload: Partial<IUser> } = req.body
  const { username } = payload

  if (username) {
    // the payload contains a username: verify that it does not already exist in the db
    const [error, user] = await to(
      getUserByUsername({ username: username.toString() })
    )
    if (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
    }
    if (user) {
      return res
        .status(StatusCodes.CONFLICT)
        .send({ message: ReasonPhrases.CONFLICT })
    }
  }

  const [error, user] = await to(
    updateUser({ id: <string>token.id, ...payload })
  )
  if (error) {
    console.error(error)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.send({ user })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getUserRequest(req, res)
  }

  if (req.method === 'PATCH') {
    return await patchUserRequest(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

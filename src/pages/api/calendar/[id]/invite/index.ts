import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { inviteCollaborator, removeInvite } from '@/controllers/calendar/group'
import { getUserByUsername } from '@/controllers/user'
import dbConnect from '@/utils/store/dbConnect'

import type { GroupCalendarRole } from '@/types/enums'
import type { NextApiRequest, NextApiResponse } from 'next'

const invite = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const { username, role } = req.body

  const [errorFind, user] = await to(
    getUserByUsername({ username: username as string })
  )

  if (errorFind) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  if (
    ((user.invites as any) || [])
      .map((_id: ObjectId) => _id.toString())
      .includes(id as string)
  ) {
    return res
      .status(StatusCodes.CONFLICT)
      .send({ message: 'User already invited' })
  }

  if (
    ((user.calendars as any) || [])
      .map((_id: ObjectId) => _id.toString())
      .includes(id as string)
  )
    return res
      .status(StatusCodes.CONFLICT)
      .send({ message: 'User already has access' })

  const [errorInvite, calendar] = await to(
    inviteCollaborator(user._id, id as string, role as GroupCalendarRole)
  )

  if (errorInvite) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.send({ message: 'OK', calendar })
}

const deleteInvite = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect()
  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { userId, calendarId } = req.query

  const [err, calendar] = await to(removeInvite(userId, calendarId))

  if (err || !calendar) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.send({ message: 'OK', calendar })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await invite(req, res)
  }

  if (req.method === 'DELETE') {
    return await deleteInvite(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

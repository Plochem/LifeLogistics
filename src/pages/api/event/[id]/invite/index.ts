import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { inviteToEvent, removeUserFromEvent } from '@/controllers/event'
import { getUserByUsername } from '@/controllers/user'
import dbConnect from '@/utils/store/dbConnect'

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

  const { username } = req.body

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

  if (token.id === user._id.toString()) {
    return res
      .status(StatusCodes.CONFLICT)
      .send({ message: 'Cannot invite yourself' })
  }

  if (
    ((user.eventInvites as any) || [])
      .map((_id: ObjectId) => _id.toString())
      .includes(id as string)
  ) {
    return res
      .status(StatusCodes.CONFLICT)
      .send({ message: 'User already invited' })
  }

  if (
    ((user.sharedEvents as any) || [])
      .map((_id: ObjectId) => _id.toString())
      .includes(id as string)
  )
    return res
      .status(StatusCodes.CONFLICT)
      .send({ message: 'User already accepted invitation' })

  const [errorInvite, event] = await to(inviteToEvent(user._id, id as string))

  if (errorInvite) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.send({ message: 'OK', event })
}

const remove = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect()
  const token = await getToken({ req })

  const { id } = req.query

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { username } = req.query

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

  const [err, event] = await to(removeUserFromEvent(id as string, user._id))
  if (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.send({ message: 'OK', event })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await invite(req, res)
  }

  if (req.method === 'DELETE') {
    return await remove(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

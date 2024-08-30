import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { respondToInvite } from '@/controllers/calendar/group'
import dbConnect from '@/utils/store/dbConnect'

import type { NextApiRequest, NextApiResponse } from 'next'

const respond = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const { status } = req.body

  const [err] = await to(respondToInvite(token.id, id as string, status))
  if (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.send({ message: 'OK' })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await respond(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

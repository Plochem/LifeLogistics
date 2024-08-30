import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { createCalendar, getCalendarsByNameOrTag } from '@/controllers/calendar'
import { addNewCalendarToUser } from '@/controllers/user'
import dbConnect from '@/utils/store/dbConnect'

import type { NextApiRequest, NextApiResponse } from 'next'

const getCalendarRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await dbConnect()

  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { name, tag, pageSize = 10, page = 1 } = req.query || {}

  if (name || tag) {
    // search for calendars by name or tag
    const [err, calendarObjects] = await to(
      getCalendarsByNameOrTag(
        token.id,
        page as number,
        pageSize as number,
        name as string,
        tag as string
      )
    )

    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
    }

    return res
      .status(StatusCodes.OK)
      .send({ calendars: calendarObjects, page, pageSize })
  }

  // search query mising name and tag
  return res
    .status(StatusCodes.BAD_REQUEST)
    .send({ message: ReasonPhrases.BAD_REQUEST })
}

const createCalendarRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await dbConnect()
  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  if (!req.body.payload) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const { name, description, color, visibility, tags, type } = req.body.payload
  const [error, newCal] = await to(
    createCalendar({
      owner: token.id,
      name,
      description,
      color,
      visibility,
      tags,
      type,
    })
  )
  if (error || newCal == null) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  const [updateUserError, updatedUser] = await to(
    addNewCalendarToUser({ id: token.id, newCalendar: newCal._id })
  )

  if (updateUserError || updatedUser == null) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    })
  }

  return res.status(StatusCodes.OK).send({ calendar: newCal })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getCalendarRequest(req, res)
  }
  if (req.method === 'POST') {
    return await createCalendarRequest(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

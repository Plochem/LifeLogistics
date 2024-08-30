import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { addEventToCalendar, getCalendar } from '@/controllers/calendar'
import { getEventsByTitle } from '@/controllers/event'
import { CalendarType, GroupCalendarRole } from '@/types/enums'
import { verifyPermissions } from '@/utils/calendar/role'
import dbConnect from '@/utils/store/dbConnect'

import type { NextApiRequest, NextApiResponse } from 'next'

const getEventRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect()

  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { title, pageSize = 10, page = 1 } = req.query || {}

  if (!title) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const [err, eventObjects] = await to(
    getEventsByTitle(
      title as string,
      token.id,
      page as number,
      pageSize as number
    )
  )

  if (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res
    .status(StatusCodes.OK)
    .send({ events: eventObjects, page, pageSize })
}

const createEventRequest = async (
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

  const { payload }: { payload: IEvent } = req.body
  const { calendar } = payload

  const [errGetCalendar, returnedCalendar] = await to(getCalendar(calendar))
  if (errGetCalendar || !returnedCalendar) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  if (returnedCalendar.type === CalendarType.GROUP) {
    const hasValidRole: boolean = verifyPermissions(
      token.id,
      returnedCalendar as IGroupCalendar,
      [GroupCalendarRole.EDITOR, GroupCalendarRole.ADMIN]
    )
    if (hasValidRole === false) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  }

  const [addEventToCalendarError, event] = await to(
    addEventToCalendar(token.id, calendar, { ...payload })
  )

  if (addEventToCalendarError || event == null) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    })
  }

  return res.status(StatusCodes.OK).send({ Event: event })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getEventRequest(req, res)
  }
  if (req.method === 'POST') {
    return await createEventRequest(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

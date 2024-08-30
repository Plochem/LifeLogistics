import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'

import { getCalendar, removeEventFromCalendar } from '@/controllers/calendar'
import { deleteEvent, getEventById, updateEvent } from '@/controllers/event'
import { getUser, removeEventFromUsers } from '@/controllers/user'
import { CalendarType, GroupCalendarRole, Visibility } from '@/types/enums'
import { verifyPermissions } from '@/utils/calendar/role'
import dbConnect from '@/utils/store/dbConnect'

import type { Types } from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'

const getEventRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect()

  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { id } = req.query

  if (!id || !ObjectId.isValid(id as string)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const [error, event] = await to(getEventById(id))

  if (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  // If event could not be found, then 404
  if (!event) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  const [getCalendarError, calendar] = await to(getCalendar(event.calendar))
  if (getCalendarError) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }
  if (!calendar) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  const [getUserError, user] = await to(getUser(calendar.owner, { lean: true }))
  if (getUserError) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  const ownerIsPrivate: boolean =
    token.id !== (calendar.owner as Types.ObjectId).toString() &&
    !user.visibility

  if (
    (calendar.visibility === Visibility.PRIVATE &&
      calendar.type === CalendarType.GROUP) ||
    (calendar.visibility === Visibility.PUBLIC &&
      calendar.type === CalendarType.GROUP &&
      ownerIsPrivate)
  ) {
    const hasValidRole: boolean = verifyPermissions(
      token.id,
      calendar as IGroupCalendar,
      [
        GroupCalendarRole.VIEWER,
        GroupCalendarRole.EDITOR,
        GroupCalendarRole.ADMIN,
      ]
    )
    if (hasValidRole === false) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  }

  return res.status(StatusCodes.OK).send({ event })
}

const patchEventRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect()

  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { id } = req.query
  const { payload }: { payload: Partial<IEvent> } = req.body

  if (!id || !ObjectId.isValid(id as string) || !payload) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const [getEventError, event] = await to(getEventById(id))

  if (getEventError) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  if (!event) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  const [getCalendarError, calendar] = await to(getCalendar(event.calendar))

  if (getCalendarError) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }
  if (!calendar) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  if (calendar.type === CalendarType.GROUP) {
    const hasValidRole: boolean = verifyPermissions(
      token.id,
      calendar as IGroupCalendar,
      [GroupCalendarRole.EDITOR, GroupCalendarRole.ADMIN]
    )
    if (hasValidRole === false) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  }

  const [updateEventError, updatedEvent] = await to(
    updateEvent({ id: id as string, ...payload })
  )

  if (updateEventError)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })

  return res.status(StatusCodes.OK).send({ event: updatedEvent })
}

const deleteEventRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await dbConnect()

  const token = await getToken({ req })

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const { id } = req.query

  if (!id || !ObjectId.isValid(id as string)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const [getEventError, event] = await to(getEventById(id))

  if (getEventError) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  if (!event) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  const [getCalendarError, calendar] = await to(getCalendar(event.calendar))

  if (getCalendarError) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }
  if (!calendar) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  if (calendar.type === CalendarType.GROUP) {
    const hasValidRole: boolean = verifyPermissions(
      token.id,
      calendar as IGroupCalendar,
      [GroupCalendarRole.EDITOR, GroupCalendarRole.ADMIN]
    )
    if (hasValidRole === false) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  }

  const [deleteEventError, deletedEvent] = await to(
    deleteEvent({ id: id as string })
  )

  if (deleteEventError)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })

  const [removeEventFromCalendarError, updatedCalendar] = await to(
    removeEventFromCalendar({ id: event.calendar, event: event._id })
  )

  if (removeEventFromCalendarError || updatedCalendar == null) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    })
  }

  const [removeEventFromUsersError] = await to(removeEventFromUsers(event._id))

  if (removeEventFromUsersError) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    })
  }

  return res.status(StatusCodes.OK).send({ event: deletedEvent })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getEventRequest(req, res)
  }
  if (req.method === 'PATCH') {
    return await patchEventRequest(req, res)
  }
  if (req.method === 'DELETE') {
    return await deleteEventRequest(req, res)
  }
  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

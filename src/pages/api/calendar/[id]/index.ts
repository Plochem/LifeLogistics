import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'

import {
  deleteCalendar,
  getCalendar,
  updateCalendar,
} from '@/controllers/calendar'
import { getSharedUsers } from '@/controllers/calendar/group'
import { getEventsByCalendar } from '@/controllers/event'
import { getUser } from '@/controllers/user'
import { LeanedGroupCalendar } from '@/models/GroupCalendar'
import { CalendarType, GroupCalendarRole, Visibility } from '@/types/enums'
import { verifyPermissions } from '@/utils/calendar/role'
import dbConnect from '@/utils/store/dbConnect'

import type { Types } from 'mongoose'
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

  const { id } = req.query

  if (!id || !ObjectId.isValid(id as string)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const [error, calendar] = await to(getCalendar(id, { lean: true }))

  if (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  if (!calendar) {
    // calendar not found
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  const [errUser, user] = await to(getUser(calendar.owner, { lean: true }))
  if (errUser || !user) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
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
    // private group calendar and you are not a collaborator, or
    // public group calendar with private owner and you are not a collaborator
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
      // invalid permissions to view this private group calendar
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  }

  if (
    (calendar.visibility === Visibility.PRIVATE &&
      calendar.type !== CalendarType.GROUP &&
      token.id !== (calendar.owner as Types.ObjectId).toString()) ||
    (calendar.visibility === Visibility.PUBLIC &&
      calendar.type !== CalendarType.GROUP &&
      ownerIsPrivate)
  ) {
    // private regular calendar and you are not the owner, or
    // public regular calendar and the owner is private
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }

  const [err, events] = await to(getEventsByCalendar(calendar._id))
  if (err || !events) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }
  calendar.events = events

  // populate invites & collaborators
  if (calendar.type === CalendarType.GROUP) {
    const [errShared, sharedUsers] = await to(getSharedUsers(calendar._id))
    if (errShared || !sharedUsers) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
    }

    ;(calendar as IGroupCalendar).invites = sharedUsers.invites
    ;(calendar as IGroupCalendar).collaborators = sharedUsers.collaborators
  }

  return res.status(StatusCodes.OK).send({ calendar })
}

const patchCalendarRequest = async (
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
  const { payload }: { payload: Partial<ICalendar> } = req.body

  if (!id || !ObjectId.isValid(id as string) || !payload) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const [error, calendar] = await to(getCalendar(id))

  if (error) {
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
    const hasValidRole: boolean =
      payload.visibility == null
        ? verifyPermissions(token.id, calendar as IGroupCalendar, [
            GroupCalendarRole.EDITOR,
            GroupCalendarRole.ADMIN,
          ])
        : verifyPermissions(token.id, calendar as IGroupCalendar, [
            GroupCalendarRole.ADMIN,
          ])
    if (hasValidRole === false) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  }

  const [error2, updatedCalendar] = await to(
    updateCalendar({ id: id as string, ...payload })
  )

  if (error2) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.status(StatusCodes.OK).send({ calendar: updatedCalendar })
}

const deleteCalendarRequest = async (
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

  const [errGetCalendar, calendar] = await to(getCalendar(id))
  if (errGetCalendar) {
    throw errGetCalendar
  }
  if (!calendar) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: ReasonPhrases.NOT_FOUND })
  }
  if ((calendar.owner as Types.ObjectId).toString() !== token.id) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send({ message: ReasonPhrases.FORBIDDEN })
  }

  const [error, deletedCalendar] = await to(deleteCalendar(id))
  if (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  return res.status(StatusCodes.OK).send({ calendar: deletedCalendar })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getCalendarRequest(req, res)
  }

  if (req.method === 'PATCH') {
    return await patchCalendarRequest(req, res)
  }

  if (req.method === 'DELETE') {
    return await deleteCalendarRequest(req, res)
  }
  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

import to from 'await-to-js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getToken } from 'next-auth/jwt'

import { getCalendar } from '@/controllers/calendar'
import {
  createCollaborator,
  deleteCollaborator,
  updateCollaborator,
} from '@/controllers/calendar/group'
import { CalendarType, GroupCalendarRole } from '@/types/enums'
import { verifyPermissions } from '@/utils/calendar/role'
import dbConnect from '@/utils/store/dbConnect'

import type { NextApiRequest, NextApiResponse } from 'next'

const createCollaboratorRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await dbConnect()
  const token = await getToken({ req })

  const { id } = req.query

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const [errGetCalendar, returnedCalendar] = await to(getCalendar(id))
  if (errGetCalendar || !returnedCalendar) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  if (returnedCalendar.type === CalendarType.GROUP) {
    const hasValidRole: boolean = verifyPermissions(
      token.id,
      returnedCalendar as IGroupCalendar,
      [GroupCalendarRole.ADMIN]
    )
    if (hasValidRole === false) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  } else {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send({ message: ReasonPhrases.FORBIDDEN })
  }

  if (!req.body) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const { user, role } = req.body

  const [errCreateCollaborator, calendar] = await to(
    createCollaborator(user, <string>id, role)
  )

  if (errCreateCollaborator)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: errCreateCollaborator.message })
  return res.send({ calendar })
}

const updateCollaboratorRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await dbConnect()
  const token = await getToken({ req })

  const { id } = req.query

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const [errGetCalendar, returnedCalendar] = await to(getCalendar(id))
  if (errGetCalendar || !returnedCalendar) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  if (returnedCalendar.type === CalendarType.GROUP) {
    const hasValidRole: boolean = verifyPermissions(
      token.id,
      returnedCalendar as IGroupCalendar,
      [GroupCalendarRole.ADMIN]
    )
    if (hasValidRole === false) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  } else {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send({ message: ReasonPhrases.FORBIDDEN })
  }

  if (!req.body) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const { user, role } = req.body

  const [errUpdateCollaborator, calendar] = await to(
    updateCollaborator(user, <string>id, role)
  )

  if (errUpdateCollaborator)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: errUpdateCollaborator.message })
  return res.send({ calendar })
}

const deleteCollaboratorRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await dbConnect()
  const token = await getToken({ req })

  const { id } = req.query

  if (!token || !token.id)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED })

  const [errGetCalendar, returnedCalendar] = await to(getCalendar(id))
  if (errGetCalendar || !returnedCalendar) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }

  if (returnedCalendar.type === CalendarType.GROUP) {
    const hasValidRole: boolean = verifyPermissions(
      token.id,
      returnedCalendar as IGroupCalendar,
      [GroupCalendarRole.ADMIN]
    )
    if (hasValidRole === false) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: ReasonPhrases.FORBIDDEN })
    }
  } else {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send({ message: ReasonPhrases.FORBIDDEN })
  }

  if (!req.body) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST })
  }

  const { user } = req.body
  const [errDeleteCollaborator, calendar] = await to(
    deleteCollaborator(user, <string>id)
  )

  if (errDeleteCollaborator)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: errDeleteCollaborator.message })

  return res.send({ calendar })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await createCollaboratorRequest(req, res)
  }

  if (req.method === 'PATCH') {
    return await updateCollaboratorRequest(req, res)
  }
  if (req.method === 'DELETE') {
    return await deleteCollaboratorRequest(req, res)
  }

  return res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send({ message: ReasonPhrases.METHOD_NOT_ALLOWED })
}

export default handler

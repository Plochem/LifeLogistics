import to from 'await-to-js'

import { addNewCalendarToUser } from '@/controllers/user'
import GroupCalendar from '@/models/GroupCalendar'
import User from '@/models/User'
import { InviteStatus } from '@/types/enums'

import type { GroupCalendarRole } from '@/types/enums'

export const getSharedUsers = (id: ObjectId) =>
  GroupCalendar.findById(id)
    .populate({
      path: 'invites.user collaborators.user',
      options: { lean: true },
    })
    .exec()

export const deleteCollaborator = async (
  userId: string,
  calendarId: string
) => {
  const [deleteCollaboratorError, calendar] = await to(
    GroupCalendar.findByIdAndUpdate(
      calendarId,
      {
        $pull: { collaborators: { user: userId } },
      },
      { returnDocument: 'after' }
    ).exec()
  )
  const [error, updateUser] = await to(
    User.findOneAndUpdate(
      { _id: userId }, // Filter for the User document to update
      {
        $pull: { calendars: calendarId },
      },
      { returnDocument: 'after' }
    ).exec()
  )
  if (deleteCollaboratorError) throw deleteCollaboratorError
  if (error) throw error

  return calendar
}

export const createCollaborator = async (
  userId: string,
  calendarId: string,
  role: GroupCalendarRole
) => {
  const [createCollaboratorError, calendar] = await to(
    GroupCalendar.updateOne(
      {
        _id: calendarId,
        'collaborators.user': { $ne: userId },
      },
      {
        $push: { collaborators: { user: userId, role } },
      },
      { returnDocument: 'after' }
    ).exec()
  )
  if (createCollaboratorError) throw createCollaboratorError

  return calendar
}

export const updateCollaborator = async (
  userId: string,
  calendarId: string,
  role: GroupCalendarRole
) => {
  const [updateCollaboratorError, calendar] = await to(
    GroupCalendar.updateOne(
      {
        _id: calendarId,
        'collaborators.user': userId,
      },
      {
        $set: { 'collaborators.$.role': role },
      },
      { returnDocument: 'after' }
    ).exec()
  )
  if (updateCollaboratorError) throw updateCollaboratorError

  return calendar
}

export const inviteCollaborator = async (
  userId: string,
  calendarId: string,
  role: GroupCalendarRole
) => {
  const [err, calendar] = await to(
    GroupCalendar.findOneAndUpdate(
      {
        _id: calendarId,
        'invites.user': { $ne: userId },
        'collaborators.user': { $ne: userId },
      },
      {
        $addToSet: { invites: { user: userId, role } },
      },
      { returnDocument: 'after' }
    ).exec()
  )

  if (err) throw err

  const [errUpdate] = await to(
    User.findByIdAndUpdate(userId, {
      $push: { invites: calendarId },
    }).exec()
  )

  if (errUpdate) throw errUpdate

  return calendar
}

export const removeInvite = async (userId: ObjectId, calendarId: ObjectId) => {
  const [err, calendar] = await to(
    GroupCalendar.findByIdAndUpdate(
      calendarId,
      {
        $pull: { invites: { user: userId } },
      },
      { returnDocument: 'after' }
    ).exec()
  )

  if (err) throw err

  const [errUpdate] = await to(
    User.findByIdAndUpdate(userId, {
      $pull: { invites: calendarId },
    }).exec()
  )

  if (errUpdate) throw errUpdate

  return calendar
}

export const respondToInvite = async (
  userId: string,
  calendarId: string,
  status: InviteStatus
) => {
  const [errUpdate] = await to(
    User.findByIdAndUpdate(userId, {
      $pull: { invites: calendarId },
    }).exec()
  )

  if (errUpdate) throw errUpdate

  const [err, calendar] = await to(
    GroupCalendar.findOneAndUpdate(
      { _id: calendarId },
      {
        $pull: { invites: { user: userId } },
      }
    ).exec()
  )

  if (err) throw err
  if (!calendar) throw new Error('Cannot find calendar')

  const role = calendar.invites.find(
    ({ user }) => (user as any as ObjectId).toString() === userId
  )?.role as GroupCalendarRole

  if (!role) throw new Error('Cannot find user')

  if (status === InviteStatus.ACCEPTED) {
    const [errAccept] = await to(createCollaborator(userId, calendarId, role))
    if (errAccept) throw errAccept

    const [errAdd] = await to(
      addNewCalendarToUser({ id: userId, newCalendar: calendarId })
    )
    if (errAdd) throw errAdd
  }
}

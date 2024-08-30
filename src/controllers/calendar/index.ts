import to from 'await-to-js'

import { createEvent } from '@/controllers/event'
import Calendar from '@/models/Calendar'
import Event from '@/models/Event'
import GroupCalendar from '@/models/GroupCalendar'
import User from '@/models/User'
import { CalendarType, GroupCalendarRole, Visibility } from '@/types/enums'
import {
  filterCalendarsByVisibility,
  verifyPermissions,
} from '@/utils/calendar/role'

import { getSharedUsers } from './group'

import type { ICalendarDocument, LeanedCalendar } from '@/models/Calendar'
import type { LeanDocument, Types } from 'mongoose'

// Get all calendars by its owner
export const getCalendarsByOwner = async (
  owner: ObjectId,
  viewer: ObjectId
) => {
  const [err, user] = await to(
    User.findById(owner).populate('invites eventInvites sharedEvents').exec()
  )
  if (err) throw err
  if (user) {
    // get calendars populated
    const { calendars, followedCalendars, pinnedCalendars } =
      await user.getCalendars()

    const filteredCals: ICalendar[] = []
    const [err2] = await to(
      Promise.all(
        [...calendars, ...followedCalendars, ...pinnedCalendars].map(
          async (cal) => {
            if (
              (viewer as Types.ObjectId).toString() ===
              (cal.owner as Types.ObjectId).toString()
            ) {
              filteredCals.push(cal)
            } else if (
              cal.type === CalendarType.GROUP &&
              cal.visibility === Visibility.PRIVATE
            ) {
              // show cal if it is a private group cal and viewer is collaborator on it
              const [err4, groupCal] = await to(getSharedUsers(cal._id))
              if (err4) throw err4
              if (
                groupCal &&
                verifyPermissions(viewer, groupCal, [
                  GroupCalendarRole.ADMIN,
                  GroupCalendarRole.EDITOR,
                  GroupCalendarRole.VIEWER,
                ])
              ) {
                filteredCals.push(cal)
              }
            } else if (cal.visibility === Visibility.PUBLIC) {
              // show cal if it is public, and owner of cal is not private
              const [err3, calOwner] = await to(User.findById(cal.owner).exec())
              if (err3) throw err3
              if (calOwner && calOwner.visibility) {
                filteredCals.push(cal)
              }
            }
          }
        )
      )
    )
    if (err2) throw err2

    user.calendars = filteredCals.filter((cal) =>
      calendars.find((cal2) => cal2._id === cal._id)
    )
    user.followedCalendars = filteredCals.filter((cal) =>
      followedCalendars.find((cal2) => cal2._id === cal._id)
    )
    user.pinnedCalendars = filteredCals.filter((cal) =>
      pinnedCalendars.find((cal2) => cal2._id === cal._id)
    )
  }
  return user
}

// Get potentially multiple calendars by name or tag (exclusive)
export const getCalendarsByNameOrTag = async (
  user: ObjectId,
  page: number,
  pageSize: number,
  name?: string,
  tag?: string
) => {
  const nameOrTag = name
    ? { name: { $regex: name, $options: 'i' } }
    : { tags: { $regex: tag, $options: 'i' } }
  const filteredCalendars: ICalendar[] = []
  const [err, calendars] = await to(
    Calendar.find(nameOrTag)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select({
        _id: 1,
        name: 1,
        owner: 1,
        description: 1,
        color: 1,
        tags: 1,
        collaborators: 1,
        visibility: 1,
      })
      .lean()
      .exec()
  )
  if (err) throw err
  if (calendars) {
    // filter calendars to exclude private calendars that the user does not have permission to view
    const [filterCalendarsErr] = await to(
      Promise.all(
        calendars.map(async (calendar) => {
          const [getUserErr, calOwner] = await to(
            User.findById(calendar.owner).exec()
          )
          if (getUserErr) throw getUserErr
          if (calOwner) {
            if (
              filterCalendarsByVisibility(
                user,
                calendar as ICalendar as IGroupCalendar,
                calOwner
              )
            ) {
              filteredCalendars.push(calendar)
            }
          }
        })
      )
    )
    if (filterCalendarsErr) throw filterCalendarsErr
  }
  return filteredCalendars
}

export const getCalendar = <T extends LeanOption>(
  id: ObjectId,
  options = {} as T
): LeanOptionResult<
  T,
  LeanedCalendar | null,
  ((Document & ICalendar) | (Document & IGroupCalendar)) | null
> => Calendar.findById(id).lean(options?.lean).exec() as any

export const getCalendars = (): Promise<ICalendar[]> =>
  Calendar.find({}).lean().exec() as Promise<ICalendar[]>

export const updateCalendar = async ({
  id,
  ...fields
}: Partial<ICalendar> & { id: string }): Promise<LeanedCalendar | null> => {
  const oldCalendar = await getCalendar(id)
  if (!oldCalendar) return null
  if (
    fields.type === CalendarType.GROUP &&
    (!oldCalendar.type || oldCalendar.type === CalendarType.CALENDAR)
  ) {
    // switching from regular calendar to group calendar
    // first update the type to group calendar, and other fields
    const [updateCalendarRequest] = await to(
      Calendar.findByIdAndUpdate(
        id,
        { $set: { ...fields } },
        { overwriteDiscriminatorKey: true }
      ).exec()
    )
    if (updateCalendarRequest) throw updateCalendarRequest

    // then add collaborator
    const [updateGcReq] = await to(
      GroupCalendar.findByIdAndUpdate(
        id,
        {
          $set: {
            collaborators: [
              { user: oldCalendar.owner, role: GroupCalendarRole.ADMIN },
            ],
            invites: [],
          },
        },
        { returnDocument: 'after', overwriteDiscriminatorKey: true }
      ).exec()
    )
    if (updateGcReq) throw updateGcReq

    // populate collaborators field and return
    return getSharedUsers(id)
  }
  if (
    fields.type === CalendarType.CALENDAR &&
    oldCalendar.type === CalendarType.GROUP
  ) {
    // switching from group calendar to regular calendar
    // remove group calendar from other user's calendar
    const [pullCalendarsError] = await to(
      User.updateMany(
        {
          _id: { $ne: oldCalendar.owner },
          $or: [{ calendars: { $in: [id] } }, { invites: { $in: [id] } }],
        },
        {
          $pull: {
            calendars: { $in: [id] },
            invites: { $in: [id] },
          },
        }
      ).exec()
    )
    if (pullCalendarsError) throw pullCalendarsError
  }
  // make regular updates
  const [err, cal] = await to(
    Calendar.findByIdAndUpdate(
      id,
      { $set: { ...fields } },
      { returnDocument: 'after', overwriteDiscriminatorKey: true }
    ).exec()
  )

  if (err) throw err
  if (!cal) return null

  return cal?.type === CalendarType.GROUP ? getSharedUsers(id) : cal
}

export const createCalendar = ({
  owner,
  name,
  description,
  color,
  visibility,
  tags,
  type,
}: {
  owner: ObjectId
  name: string
  description: string
  color: string
  visibility: Visibility
  tags?: string[]
  type: CalendarType
}): Promise<LeanedCalendar | null> => {
  if (type === CalendarType.GROUP) {
    return GroupCalendar.create({
      owner,
      name,
      description,
      color,
      visibility,
      tags,
      collaborators: [{ user: owner, role: GroupCalendarRole.ADMIN }],
    })
  }
  return Calendar.create({
    owner,
    name,
    description,
    color,
    visibility,
    tags,
  })
}

export const pinCalendar = async (
  userId: string,
  calendarId: string,
  pin = true
) =>
  pin
    ? User.findByIdAndUpdate(userId, { $push: { pinnedCalendars: calendarId } })
        .lean()
        .exec()
    : User.findByIdAndUpdate(userId, { $pull: { pinnedCalendars: calendarId } })
        .lean()
        .exec()

/* Adds an event to a calendar using a calendar id */
export const addEventToCalendar = async (
  userId: ObjectId,
  id: ObjectId,
  { ...fields }: IEvent
) => {
  const [err, event] = await to(
    createEvent({
      ...fields,
      owner: userId,
    })
  )
  if (err) throw err
  if (event) {
    await to(
      Calendar.findByIdAndUpdate(id, {
        $push: { events: event._id },
      }).exec()
    )
  }
  return event
}

/* Removes an event from a calendar using a calendar id and event id */
export const removeEventFromCalendar = ({
  id,
  event,
}: {
  id: ObjectId
  event: ObjectId
}): Promise<ICalendar | null> =>
  Calendar.findByIdAndUpdate(
    id,
    { $pull: { events: event } },
    { returnDocument: 'after' }
  ).exec()

// delete Calendar
export const deleteCalendar = async (
  id: ObjectId
): Promise<LeanDocument<ICalendar & { _id: ObjectId }> | null> => {
  const [pullCalendarsError] = await to(
    User.updateMany(
      {
        $or: [
          { calendars: { $in: [id] } },
          { pinnedCalendars: { $in: [id] } },
          { followedCalendars: { $in: [id] } },
          { invites: { $in: [id] } },
        ],
      },
      {
        $pull: {
          calendars: { $in: [id] },
          pinnedCalendars: { $in: [id] },
          followedCalendars: { $in: [id] },
          invites: { $in: [id] },
        },
      }
    ).exec()
  )

  if (pullCalendarsError) {
    throw pullCalendarsError
  }

  const [deleteEventsError] = await to(
    Event.deleteMany({
      calendar: id,
    }).exec()
  )

  if (deleteEventsError) throw deleteEventsError

  const [deleteError, calendar] = await to(
    Calendar.findByIdAndDelete(id).lean().exec()
  )
  if (deleteError) throw deleteError
  return calendar
}

import to from 'await-to-js'

import Calendar from '@/models/Calendar'
import Event from '@/models/Event'
import User from '@/models/User'
import { InviteStatus } from '@/types/enums'
import { filterCalendarsByVisibility } from '@/utils/calendar/role'

import type { LeanedEvent } from '@/models/Event'

/* Creates an event */
export const createEvent = ({
  calendar,
  title,
  description,
  startTime,
  endTime,
  reminder,
  owner,
  // recurrenceDow,
  // numberOfRecurrences,
  rrule,
  deadline,
}: {
  calendar: ObjectId
  title: string
  description: string
  startTime: Date
  endTime: Date
  reminder: number
  owner: ObjectId
  // recurrenceDow: DayOfWeek[]
  // numberOfRecurrences: number
  rrule?: any
  deadline?: Date
}): Promise<LeanedEvent | null> =>
  Event.create({
    calendar,
    title,
    description,
    startTime,
    endTime,
    reminder,
    owner,
    sharedUsers: [owner],
    // recurrenceDow,
    // numberOfRecurrences,
    rrule,
    deadline,
  })

/* Get potentially multiple events by title */
export const getEventsByTitle = async (
  title: string,
  user: ObjectId,
  page: number,
  pageSize: number
) => {
  const filteredEvents: IEvent[] = []
  const [err, events] = await to(
    Event.find({ title: { $regex: title, $options: 'i' } })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select({
        _id: 1,
        title: 1,
        description: 1,
        calendar: 1,
        startTime: 1,
        endTime: 1,
      })
      .lean()
      .exec()
  )
  if (err) throw err
  if (events) {
    // filter events to exclude private events that the user does not have permission to view
    const [filterEventsErr] = await to(
      Promise.all(
        events.map(async (event) => {
          const [getCalendarErr, calendar] = await to(
            Calendar.findById(event.calendar).exec()
          )
          if (getCalendarErr) throw getCalendarErr
          if (calendar) {
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
                filteredEvents.push(event)
              }
            }
          }
        })
      )
    )
    if (filterEventsErr) throw filterEventsErr
  }
  return filteredEvents
}

/* Get an event using its id */
export const getEventById = <T extends LeanOption>(
  id: ObjectId,
  options = {} as T
): Promise<LeanedEvent | null> => Event.findById(id).lean(options?.lean).exec()

/* Get all events */
export const getEvents = (): Promise<IEvent[]> =>
  Event.find({}).lean().exec() as Promise<IEvent[]>

/* Get all events on a calendar */
export const getEventsByCalendar = async (id: ObjectId) => {
  const [err, calendar] = await to(Calendar.findById(id).exec())
  if (err) throw err
  if (calendar == null) {
    return []
  }
  return await calendar.getEvents()
}

/* Update an event using its id */
export const updateEvent = ({
  id,
  ...fields
}: Partial<IEvent> & { id: string }): Promise<LeanedEvent | null> =>
  Event.findByIdAndUpdate(
    id,
    { $set: { ...fields } },
    { returnDocument: 'after' }
  )
    .lean()
    .exec()

/* Deletes an event using its id */
export const deleteEvent = ({
  id,
}: {
  id: string
}): Promise<LeanedEvent | null> =>
  Event.findOneAndDelete({ _id: id }).lean().exec()

export const inviteToEvent = async (userId: string, eventId: string) => {
  const [err, event] = await to(
    Event.findOneAndUpdate(
      {
        _id: eventId,
        invites: { $nin: [userId] },
      },
      {
        $push: { invites: userId },
      },
      { returnDocument: 'after', new: false }
    ).exec()
  )

  if (err) throw err

  const [errUpdate] = await to(
    User.findByIdAndUpdate(userId, {
      $push: { eventInvites: eventId },
    }).exec()
  )

  if (errUpdate) throw errUpdate

  return event
}

export const respondToEventInvite = async (
  userId: string,
  eventId: string,
  status: InviteStatus
) => {
  const [errUpdate] = await to(
    User.findByIdAndUpdate(userId, {
      $pull: { eventInvites: eventId },
      ...(status === InviteStatus.ACCEPTED && {
        $push: { sharedEvents: eventId },
      }),
    }).exec()
  )

  if (errUpdate) throw errUpdate

  const [err, event] = await to(
    Event.findOneAndUpdate(
      { _id: eventId },
      {
        $pull: { invites: userId },
        ...(status === InviteStatus.ACCEPTED && {
          $push: { sharedUsers: userId },
        }),
      }
    ).exec()
  )

  if (err) throw err
  if (!event) throw new Error('Cannot find calendar')

  return event
}

export const getEventInvites = (eventId: string) =>
  Event.findById(eventId)
    .populate({
      path: 'owner invites sharedUsers',
      options: { lean: true },
    })
    .exec()

export const removeUserFromEvent = async (eventId: string, userId: string) => {
  const [errEvent, event] = await to(
    Event.findByIdAndUpdate(
      eventId,
      {
        $pull: { invites: userId, sharedUsers: userId },
      },
      { returnDocument: 'after' }
    ).exec()
  )

  if (errEvent) throw errEvent

  const [errUser] = await to(
    User.findByIdAndUpdate(userId, {
      $pull: { eventInvites: eventId, sharedEvents: eventId },
    }).exec()
  )

  if (errUser) throw errUser

  return event
}

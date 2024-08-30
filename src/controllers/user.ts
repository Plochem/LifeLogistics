// call .exec() on queries to convert to promise

import to from 'await-to-js'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

import Event from '@/models/Event'
import User from '@/models/User'

import type { IUserDocument, LeanedUser } from '@/models/User'

dayjs.extend(timezone)

export const getUser = <T extends LeanOption>(
  id: ObjectId,
  options = {} as T
): LeanOptionResult<T, LeanedUser | null, IUserDocument | null> =>
  User.findById(id).lean(options?.lean).exec() as any

// Get exactly one user by username
export const getUserByUsername = ({
  username,
}: {
  username: string
}): Promise<LeanedUser | null> => User.findOne({ username }).lean().exec()

// Get potentially multiple users by username
export const getUsersByUsername = ({
  username,
  page,
  pageSize,
}: {
  username: string
  page: number
  pageSize: number
}): Promise<LeanedUser[] | null> =>
  User.find({
    username: { $regex: username, $options: 'i' },
    visibility: true,
  })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .select({ _id: 0, name: 1, username: 1, image: 1 })
    .lean()
    .exec()

// Get exactly one user by email
export const getUserByEmail = ({
  email,
}: {
  email: string
}): Promise<LeanedUser | null> => User.findOne({ email }).lean().exec()

export const getUsers = (): Promise<IUser[]> =>
  User.find({}).lean().exec() as Promise<IUser[]>

export const updateUser = ({
  id,
  ...fields
}: Partial<IUser> & { id: string }): Promise<LeanedUser | null> =>
  User.findByIdAndUpdate(
    id,
    { $set: { ...fields } },
    { returnDocument: 'after' }
  )
    .lean()
    .exec()

export const addNewCalendarToUser = ({
  id,
  newCalendar,
}: {
  id: ObjectId
  newCalendar: ObjectId
}): Promise<IUser | null> =>
  User.findByIdAndUpdate(
    id,
    { $push: { calendars: newCalendar } },
    { returnDocument: 'after' }
  ).exec()

export const followCalendar = (
  userId: ObjectId,
  calendarId: ObjectId,
  unfollow = false
): Promise<IUser | null> =>
  unfollow
    ? User.findByIdAndUpdate(
        userId,
        { $pull: { followedCalendars: calendarId } },
        { returnDocument: 'after' }
      ).exec()
    : User.findByIdAndUpdate(
        userId,
        { $push: { followedCalendars: calendarId } },
        { returnDocument: 'after' }
      ).exec()

export const removeEventFromUsers = (eventId: string) =>
  User.updateMany(
    {
      $or: [
        { sharedEvents: { $in: [eventId] } },
        { eventInvites: { $in: [eventId] } },
      ],
    },
    {
      $pull: {
        sharedEvents: eventId,
        eventInvites: eventId,
      },
    }
  ).exec()

export const removeExpiredEventInviteFromUser = async (id: ObjectId) => {
  const [err, user] = await to(
    User.findById(id).populate('eventInvites').exec()
  )
  if (!err && user) {
    const filteredInvitesIds = user.eventInvites
      .filter((invite) => {
        if (invite.deadline) {
          return dayjs(invite.deadline).isBefore(new Date())
        }
        return false
      })
      .map((invite) => invite._id)
    // remove user from events' invites
    await to(
      Event.updateMany(
        {
          _id: { $in: filteredInvitesIds },
        },
        {
          $pull: {
            invites: id,
          },
        }
      ).exec()
    )
    // remove event invite from user
    await to(
      User.findByIdAndUpdate(id, {
        $pull: {
          eventInvites: {
            $in: filteredInvitesIds,
          },
        },
      }).exec()
    )
  }
}

// addCalendar(userid, caledarid) to user
// deleteCalendar(userid, calendarid) from user

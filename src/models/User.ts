import { Schema, model, models } from 'mongoose'

import type { Document, LeanDocument, Model, Types } from 'mongoose'

interface IUserMethods {
  getCalendars: () => Promise<{
    calendars: ICalendar[]
    pinnedCalendars: ICalendar[]
    followedCalendars: ICalendar[]
  }>
}

interface IUserModel extends Model<IUser, {}, IUserMethods> {}

export interface IUserDocument extends Document<ObjectId, any, IUser> {}

export type LeanedUser = LeanDocument<IUser & { _id: Types.ObjectId }>

const UserSchema = new Schema<IUser, IUserModel>({
  visibility: Boolean,
  calendars: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Calendar',
    },
  ],
  followedCalendars: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Calendar',
    },
  ],
  pinnedCalendars: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Calendar',
    },
  ],
  username: String,
  bio: String,
  invites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Calendar',
    },
  ],
  eventInvites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
  sharedEvents: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
})

UserSchema.method(
  'getCalendars',
  async function getCalendars(this: IUserDocument) {
    try {
      const user = await this.populate<{
        calendars: ICalendar[]
        pinnedCalendars: ICalendar[]
        followedCalendars: ICalendar[]
      }>({
        path: 'calendars pinnedCalendars followedCalendars',
        populate: {
          path: 'events',
        },
      })
      return {
        calendars: user.calendars,
        pinnedCalendars: user.pinnedCalendars,
        followedCalendars: user.followedCalendars,
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }
)

UserSchema.index({ username: 1 })

// must load plugin before model creation
// we can't use a global plugin since we can't guarantee that it'll be loaded before model compilation
// UserSchema.plugin(require('@/utils/store/leanObjectIdToString'))

export default (models.User as IUserModel) ||
  model<IUserDocument, IUserModel>('User', UserSchema)

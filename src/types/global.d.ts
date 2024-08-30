/* eslint-disable vars-on-top */
/* eslint-disable no-var */

import type {
  CalendarType,
  DayOfWeek,
  InviteStatus,
  RRuleFrequency,
  Visibility,
} from './enums'
import type Mongoose from 'mongoose'
import type { User } from 'next-auth'
import type { ParsedOptions } from 'rrule/dist/esm/types'

type Infer<T> = T extends { lean: infer R } ? R : false
type Mapped<T, LeanedDoc, Doc> = T extends true
  ? Promise<LeanedDoc>
  : T extends false
  ? Promise<Doc>
  : never

declare global {
  var mongoose: { conn: ?Mongoose; promise: ?Promise<Mongoose> }

  type ObjectId = Types.ObjectId

  type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>
  }

  // for optional leaning in function calls
  type LeanOption = { lean?: boolean }
  type LeanOptionResult<T, LeanedDoc, Doc> = Mapped<Infer<T>, LeanedDoc, Doc>

  type RRuleOptions = ParsedOptions

  // declare general interfaces for User
  // then extends these interfaces to be document types

  interface IUser extends User {
    // put in additional fields
    _id: ObjectId
    visibility: boolean
    calendars: ICalendar[]
    followedCalendars: ICalendar[]
    pinnedCalendars: ICalendar[]
    username: string
    bio: string
    invites: ICalendar[]
    // events that are shared with the user
    sharedEvents: IEvent[]
    // events that user has been invited to
    eventInvites: IEvent[]
  }

  interface ICalendar {
    _id: ObjectId
    owner: ObjectId
    events: IEvent[]
    name: string
    description: string
    visibility: Visibility
    color: string
    tags: string[]
    // discriminator key
    type: CalendarType | undefined
  }

  interface GroupCalendarSharedUser {
    user: IUser
    role: GroupCalendarRole
  }

  interface IGroupCalendar extends ICalendar {
    collaborators: GroupCalendarSharedUser[]
    invites: GroupCalendarSharedUser[]
  }

  interface IEvent {
    _id: ObjectId
    calendar: ObjectId
    title: string
    owner: ObjectId
    sharedUsers: IUser[]
    invites: IUser[]
    description: string
    startTime: Date
    endTime: Date
    reminder: number
    rrule?: RRuleOptions
    deadline?: Date
  }

  // interface IEvent {
  //   _id: ObjectId
  //   calendar: ObjectId
  //   startTime: Date
  //   endTime: Date
  //   recurrenceDow: DayOfWeek[]
  //   title: string
  //   description: string
  //   reminder: number
  //   numberOfRecurrences: number
  // }
}

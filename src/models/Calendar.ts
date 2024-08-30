import { Schema, model, models } from 'mongoose'

import type { Visibility } from '@/types/enums'
import type { ObjectId } from 'mongodb'
import type {
  Document,
  LeanDocument,
  Model,
  SchemaDefinitionProperty,
} from 'mongoose'

interface ICalendarMethods {
  getEvents: () => Promise<IEvent[]>
}

interface ICalendarModel extends Model<ICalendar, {}, ICalendarMethods> {}

export interface ICalendarDocument extends Document<ObjectId, any, ICalendar> {}

export type LeanedCalendar = LeanDocument<ICalendar>

const CalendarSchema = new Schema<ICalendar, ICalendarModel>(
  {
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: String,
    description: String,
    visibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public',
    } as any as SchemaDefinitionProperty<Visibility> | undefined,
    color: String,
    tags: [String],
  },
  {
    discriminatorKey: 'type',
  }
)

CalendarSchema.method(
  'getEvents',
  async function getEvents(this: ICalendarDocument) {
    try {
      const calendar = await this.populate<{
        events: IEvent[]
      }>('events')
      return calendar.events
    } catch (e) {
      return Promise.reject(e)
    }
  }
)

// must load plugin before model creation
// we can't use a global plugin since we can't guarantee that it'll be loaded before model compilation
// CalendarSchema.plugin(require('@/utils/store/leanObjectIdToString'))

export default (models.Calendar as ICalendarModel) ||
  model<ICalendarDocument, ICalendarModel>('Calendar', CalendarSchema)

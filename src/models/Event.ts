import { Schema, model, models } from 'mongoose'

import type { ObjectId } from 'mongodb'
import type { Document, LeanDocument, Model } from 'mongoose'

interface IEventMethods {}

interface IEventModel extends Model<IEvent, {}, IEventMethods> {}

export interface IEventDocument extends Document<ObjectId, any, IEvent> {}

export type LeanedEvent = LeanDocument<IEvent>

const EventSchema = new Schema<IEvent, IEventModel>({
  calendar: {
    type: Schema.Types.ObjectId,
    ref: 'Calendar',
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  reminder: Number,
  invites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  sharedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  rrule: {
    type: Schema.Types.Mixed,
    required: false,
  },
  deadline: {
    type: Date,
    required: false,
  },
})

// must load plugin before model creation
// we can't use a global plugin since we can't guarantee that it'll be loaded before model compilation
// EventSchema.plugin(require('@/utils/store/leanObjectIdToString'))

export default (models.Event as IEventModel) ||
  model<IEventDocument, IEventModel>('Event', EventSchema)

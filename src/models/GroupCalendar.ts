import { Schema, models } from 'mongoose'

import ICalendarModel from './Calendar'

import type { ObjectId } from 'mongodb'
import type {
  Document,
  LeanDocument,
  Model,
  SchemaDefinitionProperty,
} from 'mongoose'

interface IGroupCalendarModel extends Model<IGroupCalendar, {}, {}> {}

export interface IGroupCalendarDocument
  extends Document<ObjectId, any, IGroupCalendar> {}

export type LeanedGroupCalendar = LeanDocument<IGroupCalendar>

const GroupCalendarSchema = new Schema<IGroupCalendar, IGroupCalendarModel>(
  {
    collaborators: [
      {
        _id: false,
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['Viewer', 'Editor', 'Admin'],
          default: 'Viewer',
        } as any as
          | SchemaDefinitionProperty<GroupCalendarSharedUser>
          | undefined,
      },
    ],
    invites: [
      {
        _id: false,
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['Viewer', 'Editor', 'Admin'],
          default: 'Viewer',
        } as any as
          | SchemaDefinitionProperty<GroupCalendarSharedUser>
          | undefined,
      },
    ],
  },
  {
    discriminatorKey: 'type',
  }
)

export default (models.GroupCalendar as IGroupCalendarModel) ||
  ICalendarModel.discriminator('GroupCalendar', GroupCalendarSchema)

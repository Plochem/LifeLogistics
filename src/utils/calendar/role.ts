import { CalendarType, GroupCalendarRole, Visibility } from '@/types/enums'

import type { Types } from 'mongoose'

export const verifyPermissions = (
  userId: string,
  calendar: IGroupCalendar,
  roles: GroupCalendarRole[]
) => {
  if (
    (calendar.owner as Types.ObjectId).toString() === userId ||
    (calendar.type === CalendarType.GROUP &&
      calendar.collaborators.find(
        ({ user, role }) =>
          user._id.toString() === userId && roles.includes(role)
      ))
  ) {
    return true
  }
  return false
}

export const filterCalendarsByVisibility = (
  userId: string,
  calendar: IGroupCalendar,
  calOwner: IUser
) => {
  const ownerIsPrivate: boolean =
    userId !== (calendar.owner as Types.ObjectId).toString() &&
    !calOwner.visibility
  if (calendar.visibility === Visibility.PUBLIC && ownerIsPrivate === false) {
    // this calendar is public and its owner is public
    return true
  }
  if (calendar.type === CalendarType.GROUP) {
    const groupCalendar = calendar as unknown as IGroupCalendar
    const hasValidRole: boolean = verifyPermissions(userId, groupCalendar, [
      GroupCalendarRole.VIEWER,
      GroupCalendarRole.EDITOR,
      GroupCalendarRole.ADMIN,
    ])
    if (hasValidRole === true) {
      // user is a collaborator of this calendar
      return true
    }
  } else if (userId === (calendar.owner as Types.ObjectId).toString()) {
    // user owns this calendar
    return true
  }
  return false
}

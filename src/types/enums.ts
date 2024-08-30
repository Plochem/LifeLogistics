export enum Visibility {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
}
export enum DayOfWeek {
  MONDAY = 'MO',
  TUESDAY = 'TU',
  WEDNESDAY = 'WE',
  THURSDAY = 'TH',
  FRIDAY = 'FR',
  SATURDAY = 'SA',
  SUNDAY = 'SU',
}

export enum RRuleFrequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3,
  HOURLY = 4,
  MINUTELY = 5,
  SECONDLY = 6,
}

export enum CalendarType {
  CALENDAR = 'Calendar',
  GROUP = 'GroupCalendar',
}

export enum InviteStatus {
  PENDING = 'Pending',
  DECLINED = 'Declined',
  ACCEPTED = 'Accepted',
}

export enum GroupCalendarRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer',
}

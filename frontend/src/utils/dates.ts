import {
  format,
  addDays,
  subDays,
  startOfWeek,
  isSameDay,
  parseISO,
} from 'date-fns'

export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatTimeForApi(time: string): string {
  if (time.includes(':')) {
    const parts = time.split(':')
    return `${parts[0]}:${parts[1]}`
  }
  return time
}

export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTimeForDisplay24h(start)} - ${formatTimeForDisplay24h(end)}`
}

export function formatTimeForDisplay24h(time: string): string {
  const parts = time.split(':')
  return `${parts[0]}:${parts[1]}`
}

export function getDayOfMonth(date: Date): string {
  return format(date, 'd')
}

export function getShortDayName(date: Date): string {
  return format(date, 'EEE')
}

export function getWeekdayLetter(date: Date): string {
  return format(date, 'EEEEE')
}

export function getFullDateDisplay(date: Date): string {
  return format(date, 'EEE / MMM yyyy')
}

export function getHeaderDayLabel(date: Date): string {
  return format(date, 'EEE')
}

export function getHeaderMonthYearLabel(date: Date): string {
  return format(date, 'MMM yyyy')
}

export function getMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function getPreviousWeek(date: Date): Date {
  return subDays(date, 7)
}

export function getNextWeek(date: Date): Date {
  return addDays(date, 7)
}

export function isSameDayAs(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2)
}

export function parseDateString(dateStr: string): Date {
  return parseISO(dateStr)
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}


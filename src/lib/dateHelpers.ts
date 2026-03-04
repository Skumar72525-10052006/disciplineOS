import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    differenceInDays,
    subDays,
    addDays,
    isToday,
    isBefore,
    isAfter,
    parseISO,
} from 'date-fns'

export const DATE_FORMAT = 'yyyy-MM-dd'
export const TIME_FORMAT = 'HH:mm'

export function formatDate(date: Date): string {
    return format(date, DATE_FORMAT)
}

export function formatTime(date: Date): string {
    return format(date, TIME_FORMAT)
}

export function today(): string {
    return formatDate(new Date())
}

export function getDaysOfWeek(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}

export function getMonthDays(year: number, month: number): string[] {
    const start = startOfMonth(new Date(year, month))
    const end = endOfMonth(new Date(year, month))
    return eachDayOfInterval({ start, end }).map(d => formatDate(d))
}

export function getWeekRange(date: Date = new Date()) {
    return {
        start: formatDate(startOfWeek(date, { weekStartsOn: 1 })),
        end: formatDate(endOfWeek(date, { weekStartsOn: 1 })),
    }
}

export function daysBetween(date1: string, date2: string): number {
    return Math.abs(differenceInDays(parseISO(date1), parseISO(date2)))
}

export function isOverdue(dueDate: string): boolean {
    return isBefore(parseISO(dueDate), new Date()) && !isToday(parseISO(dueDate))
}

export function getDateNDaysAgo(n: number): string {
    return formatDate(subDays(new Date(), n))
}

export function getDateNDaysFromNow(n: number): string {
    return formatDate(addDays(new Date(), n))
}

export { isToday, isBefore, isAfter, parseISO, format, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval }

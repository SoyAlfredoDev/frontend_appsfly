const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const

export const WEEKDAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'] as const

export function monthKeyFromDateKey(dateKey: string): string {
  return dateKey.slice(0, 7)
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${nextMonth}`
}

/** Celdas de lunes a domingo. `null` es un día fuera del mes. */
export function buildMonthCells(monthKey: string): Array<string | null> {
  const [year, month] = monthKey.split('-').map(Number)
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const leading = (firstWeekday + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: Array<string | null> = Array.from({ length: leading }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${monthKey}-${String(day).padStart(2, '0')}`)
  }

  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function formatMonthTitle(monthKey: string): string {
  const month = Number(monthKey.slice(5, 7))
  const year = monthKey.slice(0, 4)
  return `${MONTHS[month - 1] ?? monthKey} ${year}`
}

export function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return dateKey
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()]
  return `${weekday} ${day} de ${MONTHS[month - 1]}`
}

export function formatDayNumber(dateKey: string): string {
  return String(Number(dateKey.slice(8, 10)))
}

import type { ReactNode } from 'react'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaStore } from 'react-icons/fa'
import type {
  AppointmentSlot,
  AppointmentStatus,
  PublicBookingPage,
} from '../../api/publicAppointments'
import {
  buildMonthCells,
  formatDateLabel,
  formatDayNumber,
  formatMonthTitle,
  monthKeyFromDateKey,
  WEEKDAY_LABELS,
} from './appointmentBookingCalendar'

export const BOOKING_TIMEZONE = 'America/Santiago'
export const PRIMARY_BUTTON =
  'inline-flex min-h-12 items-center justify-center rounded-xl border border-[#086941] bg-[#086941] px-4 py-2.5 text-center text-base font-semibold text-white no-underline hover:bg-[#075b39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#086941] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-700'
export const SECONDARY_BUTTON =
  'inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-base font-semibold text-dark no-underline hover:border-[#086941] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#086941] disabled:opacity-50'
const PICK_BUTTON =
  'min-h-12 rounded-xl border px-2 py-2 text-center font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#086941]'
const SELECTED = 'border-[#086941] bg-[#d9f8e9] text-[#075636]'
const UNSELECTED = 'border-slate-300 bg-white text-dark hover:border-[#086941]'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente de confirmación',
  CONFIRMED: 'Cita confirmada',
  CANCELLED: 'Cita cancelada',
  COMPLETED: 'Cita atendida',
  RESCHEDULED: 'Cita reagendada',
}

export function AppointmentStatusLabel({ status = 'PENDING' }: { status?: AppointmentStatus }) {
  const color =
    status === 'PENDING'
      ? 'bg-amber-100 text-amber-900'
      : status === 'CANCELLED'
        ? 'bg-slate-100 text-slate-700'
        : 'bg-[#d9f8e9] text-[#075636]'
  return (
    <p className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${color}`}>
      {STATUS_LABELS[status]}
    </p>
  )
}

export function formatAppointmentTime(startsAt: string, timezone: string) {
  const value = new Date(startsAt)
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: 'full',
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone: timezone,
  }
  try {
    return new Intl.DateTimeFormat('es-CL', options).format(value)
  } catch {
    return new Intl.DateTimeFormat('es-CL', { ...options, timeZone: BOOKING_TIMEZONE }).format(
      value,
    )
  }
}

export function groupAppointmentSlots(slots: AppointmentSlot[]) {
  const byDate = new Map<string, AppointmentSlot[]>()
  for (const slot of [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const day = byDate.get(slot.dateKey) ?? []
    day.push(slot)
    byDate.set(slot.dateKey, day)
  }
  return byDate
}

export function BookingShell({
  business,
  children,
  aside,
}: {
  business?: PublicBookingPage['business']
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-[#f2f4f7] font-sans text-dark sm:px-6 sm:py-7">
      <div className="mx-auto max-w-[66rem] overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm">
        <header className="flex min-h-16 items-center gap-3 border-b border-slate-200 px-5 sm:px-8">
          {business?.logoUrl ? (
            <img src={business.logoUrl} alt="" className="size-9 rounded-lg object-contain" />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#def7eb] text-[#086941]">
              <FaStore aria-hidden="true" />
            </span>
          )}
          <span className="text-lg font-bold text-dark">{business?.name || 'AppsFly'}</span>
        </header>
        <div className={aside ? 'lg:grid lg:grid-cols-[1fr_22rem]' : ''}>
          <main className="mx-auto w-full max-w-xl px-5 pb-8 pt-7 sm:px-8 sm:pt-9">{children}</main>
          {aside ? (
            <aside className="border-t border-slate-200 bg-[#f7f9fb] lg:border-l lg:border-t-0">
              {aside}
            </aside>
          ) : null}
        </div>
        <footer className="border-t border-slate-200 px-5 py-3 text-center text-xs text-slate-500">
          Agendamiento por AppsFly
        </footer>
      </div>
    </div>
  )
}

export function BookingContact({ business }: { business?: PublicBookingPage['business'] }) {
  const phone = business?.phone?.replace(/[^\d+]/g, '')
  const whatsapp = business?.whatsappUrl?.match(/^https:\/\/(?:wa\.me|api\.whatsapp\.com)\//)
  const href = whatsapp
    ? business?.whatsappUrl
    : phone && /^\+?\d{7,15}$/.test(phone)
      ? `tel:${phone}`
      : null
  if (!href) return null
  return (
    <a className={`${SECONDARY_BUTTON} w-full`} href={href}>
      Contactar al negocio
    </a>
  )
}

export function BookingSummary({
  startsAt,
  timezone,
  duration,
  children,
}: {
  startsAt: string
  timezone: string
  duration?: number
  children?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#e8f8f0] px-4 py-3">
      <FaCalendarAlt aria-hidden="true" className="shrink-0 text-[#086941]" />
      <div className="min-w-0">
        <p className="font-semibold first-letter:uppercase">
          <time dateTime={startsAt}>{formatAppointmentTime(startsAt, timezone)}</time>
        </p>
        {duration ? <p className="text-sm text-slate-600">{duration} min</p> : null}
        {children}
      </div>
    </div>
  )
}

export function AppointmentDayStrip({
  dates,
  selectedDate,
  chooseDate,
}: {
  dates: string[]
  selectedDate: string
  chooseDate: (date: string) => void
}) {
  const initialDates = dates.slice(0, 3)
  const visibleDates =
    selectedDate && !initialDates.includes(selectedDate)
      ? [...initialDates.slice(0, 2), selectedDate]
      : initialDates
  return (
    <div aria-label="Próximos días disponibles" role="group" className="grid grid-cols-3 gap-2.5">
      {visibleDates.map((date) => (
        <button
          key={date}
          type="button"
          aria-label={formatDateLabel(date)}
          aria-pressed={selectedDate === date}
          onClick={() => chooseDate(date)}
          className={`${PICK_BUTTON} ${selectedDate === date ? SELECTED : UNSELECTED}`}
        >
          <span className="block text-xs uppercase tracking-wide">
            {formatDateLabel(date).slice(0, 3)}
          </span>
          <span className="text-xl leading-tight">{formatDayNumber(date)}</span>
        </button>
      ))}
    </div>
  )
}

export function AppointmentCalendar({
  dates,
  selectedDate,
  chooseDate,
}: {
  dates: string[]
  selectedDate: string
  chooseDate: (date: string) => void
}) {
  const months = [...new Set(dates.map(monthKeyFromDateKey))]
  const month = monthKeyFromDateKey(selectedDate)
  const active = months.indexOf(month)
  if (active < 0) return null
  const navigate = (delta: number) => {
    const nextMonth = months[active + delta]
    const firstOpenDate = dates.find((date) => monthKeyFromDateKey(date) === nextMonth)
    if (firstOpenDate) chooseDate(firstOpenDate)
  }
  return (
    <div
      id="booking-calendar"
      role="group"
      className="rounded-xl border border-slate-200 p-3"
      aria-label="Calendario completo"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={active === 0}
          onClick={() => navigate(-1)}
          className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 disabled:opacity-35"
        >
          <FaChevronLeft aria-hidden="true" />
        </button>
        <p aria-live="polite" className="text-sm font-semibold capitalize">
          {formatMonthTitle(month)}
        </p>
        <button
          type="button"
          aria-label="Mes siguiente"
          disabled={active === months.length - 1}
          onClick={() => navigate(1)}
          className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 disabled:opacity-35"
        >
          <FaChevronRight aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-7 items-center gap-1 text-center">
        {WEEKDAY_LABELS.map((day) => (
          <span key={day} className="py-2 text-xs font-semibold text-slate-600">
            {day}
          </span>
        ))}
        {buildMonthCells(month).map((date, index) =>
          date && dates.includes(date) ? (
            <button
              key={date}
              type="button"
              aria-label={formatDateLabel(date)}
              aria-pressed={date === selectedDate}
              className={`min-h-10 rounded-lg text-sm font-semibold ${date === selectedDate ? SELECTED : UNSELECTED}`}
              onClick={() => chooseDate(date)}
            >
              {formatDayNumber(date)}
            </button>
          ) : (
            <span
              key={date ?? `empty-${index}`}
              className="min-h-10 content-center text-sm text-slate-400"
            >
              {date ? formatDayNumber(date) : ''}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

export function AppointmentTimes({
  slots,
  selected,
  onSelect,
}: {
  slots: AppointmentSlot[]
  selected: string
  onSelect: (slot: AppointmentSlot) => void
}) {
  const columnClass = slots.length > 4 ? 'grid-cols-2' : ''
  return (
    <div role="group" aria-label="Horas disponibles" className={`grid gap-2 ${columnClass}`}>
      {slots.map((slot) => (
        <button
          key={slot.startsAt}
          type="button"
          aria-pressed={selected === slot.startsAt}
          className={`${PICK_BUTTON} tabular-nums ${selected === slot.startsAt ? SELECTED : UNSELECTED}`}
          onClick={() => onSelect(slot)}
        >
          {slot.label}
        </button>
      ))}
    </div>
  )
}

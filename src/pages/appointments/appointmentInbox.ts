import { resolveBusinessTimezone } from '../../utils/businessTime.js'

type ScheduledAppointment = {
  startsAt: string
  status: string
}

export function formatAppointmentTime(value: string, timezone: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('es-CL', {
    timeZone: resolveBusinessTimezone(timezone),
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}

export function appointmentDay(value: Date | string, timezone: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  // Unlike legacy sale dates, an appointment at midnight UTC is still an instant.
  return date.toLocaleDateString('en-CA', { timeZone: resolveBusinessTimezone(timezone) })
}

export function groupActiveAppointments<T extends ScheduledAppointment>(
  appointments: T[],
  timezone: string,
  now = new Date(),
) {
  const today = appointmentDay(now, timezone)
  const groups = {
    pending: [] as T[],
    today: [] as T[],
    upcoming: [] as T[],
    past: [] as T[],
  }

  for (const appointment of appointments) {
    const date = appointmentDay(appointment.startsAt, timezone)
    if (appointment.status === 'PENDING') groups.pending.push(appointment)
    else if (date === today) groups.today.push(appointment)
    else if (date > today) groups.upcoming.push(appointment)
    else groups.past.push(appointment)
  }

  return [
    { id: 'pending', label: 'Solicitudes pendientes', appointments: groups.pending },
    { id: 'today', label: 'Citas de hoy', appointments: groups.today },
    { id: 'upcoming', label: 'Próximas citas', appointments: groups.upcoming },
    { id: 'past', label: 'Citas anteriores', appointments: groups.past },
  ].filter((group) => group.appointments.length > 0)
}

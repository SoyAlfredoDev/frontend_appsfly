import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  changeManagedAppointment,
  fetchManagedAppointment,
  fetchPublicAppointmentSlots,
} from '../../api/publicAppointments'
import type { AppointmentSlot, ManagedAppointment } from '../../api/publicAppointments'
import {
  AppointmentCalendar,
  AppointmentDayStrip,
  AppointmentStatusLabel,
  AppointmentTimes,
  BOOKING_TIMEZONE,
  BookingContact,
  BookingShell,
  BookingSummary,
  groupAppointmentSlots,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from './AppointmentBookingUI'
import AppointmentLocationSection from './AppointmentLocationSection'

function downloadCalendar(appointment: ManagedAppointment['appointment'], name: string) {
  const utcDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')
  const calendarText = (value: string) =>
    value
      .replace(/\\/g, '\\\\')
      .replace(/[\r\n]+/g, '\\n')
      .replace(/([,;])/g, '\\$1')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AppsFly//Citas//ES',
    'BEGIN:VEVENT',
    `UID:${calendarText(appointment.appointmentId)}@appsfly.cl`,
    `DTSTAMP:${utcDate(new Date().toISOString())}`,
    `DTSTART:${utcDate(appointment.startsAt)}`,
    ...(appointment.endsAt ? [`DTEND:${utcDate(appointment.endsAt)}`] : []),
    `SUMMARY:${calendarText(`Cita con ${name}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ]
  const file = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = 'cita.ics'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const TITLE = 'font-display text-3xl font-bold leading-tight text-dark'
const LINK = 'min-h-11 font-semibold text-[#086941] underline underline-offset-4'

export default function PublicAppointmentManagement({
  businessId,
  token,
}: {
  businessId: string
  token: string
}) {
  const [result, setResult] = useState<ManagedAppointment>()
  const [state, setState] = useState<'loading' | 'ready' | 'invalid' | 'error'>('loading')
  const [mode, setMode] = useState<'summary' | 'reschedule' | 'cancel'>('summary')
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [slotState, setSlotState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [selectedDate, setSelectedDate] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [calendar, setCalendar] = useState(false)
  const [pending, setPending] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const request = useRef<AbortController | null>(null)
  const actionInProgress = useRef(false)

  useEffect(() => {
    document.title = result?.business?.name
      ? `Tu cita | ${result.business.name}`
      : 'Tu cita | AppsFly'
  }, [result?.business?.name])

  const loadAppointment = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setState('loading')
    try {
      const response = await fetchManagedAppointment(businessId, token, controller.signal)
      if (controller.signal.aborted) return
      setResult(response.data)
      setState('ready')
    } catch (error) {
      if (controller.signal.aborted) return
      const invalid = axios.isAxiosError(error) && error.response?.status === 404
      setState(invalid ? 'invalid' : 'error')
    }
  }, [businessId, token])

  useEffect(() => {
    void loadAppointment()
    return () => request.current?.abort()
  }, [loadAppointment])

  useEffect(() => {
    if (state === 'ready') heading.current?.focus()
  }, [state, mode])

  async function loadAlternatives() {
    if (!result) return
    setSlotState('loading')
    setStartsAt('')
    try {
      const response = await fetchPublicAppointmentSlots(businessId, request.current?.signal)
      const otherSlots = response.data.slots.filter(
        (slot) =>
          new Date(slot.startsAt).getTime() !== new Date(result.appointment.startsAt).getTime(),
      )
      setSlots(otherSlots)
      const dates = [...groupAppointmentSlots(otherSlots).keys()]
      setSelectedDate((previous) => (dates.includes(previous) ? previous : (dates[0] ?? '')))
      setSlotState('ready')
    } catch (error) {
      if (!axios.isCancel(error)) setSlotState('error')
    }
  }

  function goTo(mode: 'summary' | 'reschedule' | 'cancel') {
    setMode(mode)
    setCalendar(false)
    setActionError('')
    setStatusMessage('')
    if (mode === 'reschedule') void loadAlternatives()
  }

  function chooseDate(date: string) {
    setSelectedDate(date)
    setStartsAt('')
  }

  async function update(change: { action: 'cancel' } | { action: 'reschedule'; startsAt: string }) {
    if (actionInProgress.current) return
    actionInProgress.current = true
    setPending(true)
    setActionError('')
    try {
      const response = await changeManagedAppointment(businessId, token, change)
      setResult(response.data)
      setMode('summary')
      setStatusMessage(
        change.action === 'cancel'
          ? 'Tu cita se canceló.'
          : 'El negocio debe confirmar el nuevo horario.',
      )
    } catch (error) {
      const code = axios.isAxiosError<{ code?: string }>(error)
        ? error.response?.data?.code
        : undefined
      if (code === 'SLOT_UNAVAILABLE') {
        setActionError('El horario ya se ocupó. Elige otra hora.')
        await loadAlternatives()
      } else if (code === 'APPOINTMENT_CHANGE_NOT_AVAILABLE') {
        setMode('summary')
        setStatusMessage('La cita cambió. Revisa su estado actual.')
        await loadAppointment()
      } else {
        setActionError('No pudimos guardar el cambio. Intenta nuevamente.')
      }
    } finally {
      actionInProgress.current = false
      setPending(false)
    }
  }

  async function copyManagementLink() {
    try {
      const { origin, pathname, hash } = window.location
      await navigator.clipboard.writeText(`${origin}${pathname}${hash}`)
      setStatusMessage('Enlace privado copiado.')
    } catch {
      setStatusMessage('Puedes guardar el enlace desde la barra de direcciones.')
    }
  }

  const grouped = groupAppointmentSlots(slots)
  const dates = [...grouped.keys()]

  return (
    <BookingShell business={result?.business}>
      {state === 'loading' ? <p role="status">Cargando tu cita…</p> : null}
      {state === 'error' ? (
        <div className="space-y-4">
          <h1 className={TITLE}>No pudimos cargar tu cita</h1>
          <button
            type="button"
            onClick={() => void loadAppointment()}
            className={`${PRIMARY_BUTTON} w-full`}
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {state === 'invalid' ? (
        <div className="space-y-4">
          <h1 className={TITLE}>El enlace de la cita no está disponible</h1>
          <Link to={{ hash: '' }} className={`${SECONDARY_BUTTON} w-full`}>
            Ver agenda del negocio
          </Link>
        </div>
      ) : null}
      {state === 'ready' && result ? (
        <section className="space-y-4">
          <h1 ref={heading} tabIndex={-1} className={`${TITLE} focus:outline-none`}>
            {mode === 'reschedule'
              ? 'Elige un nuevo horario'
              : mode === 'cancel'
                ? 'Cancelar cita'
                : 'Tu cita'}
          </h1>
          <AppointmentStatusLabel status={result.appointment.status} />
          <BookingSummary
            startsAt={result.appointment.startsAt}
            timezone={result.timezone || BOOKING_TIMEZONE}
          />
          {statusMessage ? (
            <p role="status" className="rounded-xl bg-[#e8f8f0] p-3 text-sm">
              {statusMessage}
            </p>
          ) : null}
          {actionError ? (
            <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
              {actionError}
            </p>
          ) : null}
          {mode === 'summary' ? (
            <>
              {result.canReschedule ? (
                <button
                  type="button"
                  onClick={() => goTo('reschedule')}
                  className={`${PRIMARY_BUTTON} w-full`}
                >
                  Cambiar horario
                </button>
              ) : null}
              {result.canCancel ? (
                <button
                  type="button"
                  onClick={() => goTo('cancel')}
                  className={`${SECONDARY_BUTTON} w-full`}
                >
                  Cancelar cita
                </button>
              ) : null}
              {result.appointment.status === 'CONFIRMED' ||
              result.appointment.status === 'RESCHEDULED' ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCalendar(result.appointment, result.business?.name ?? 'AppsFly')
                    }
                    className={`${SECONDARY_BUTTON} w-full`}
                  >
                    Agregar al calendario
                  </button>
                  {result.location?.mapsUrl ? (
                    <a
                      href={result.location.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`${SECONDARY_BUTTON} w-full`}
                    >
                      Cómo llegar
                    </a>
                  ) : (
                    <AppointmentLocationSection location={result.location} compact />
                  )}
                </>
              ) : null}
              <BookingContact business={result.business} />
              <button type="button" onClick={() => void copyManagementLink()} className={LINK}>
                Copiar enlace privado
              </button>
            </>
          ) : null}
          {mode === 'cancel' ? (
            <>
              <p className="text-sm text-slate-700">
                Al cancelar, se liberará el horario para otra persona.
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={() => void update({ action: 'cancel' })}
                className={`${PRIMARY_BUTTON} w-full`}
              >
                {pending ? 'Cancelando…' : 'Confirmar cancelación'}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => goTo('summary')}
                className={`${SECONDARY_BUTTON} w-full`}
              >
                Volver a mi cita
              </button>
            </>
          ) : null}
          {mode === 'reschedule' ? (
            <>
              {slotState === 'loading' ? <p role="status">Cargando horarios…</p> : null}
              {slotState === 'error' ? (
                <>
                  <p role="alert">No pudimos cargar los horarios.</p>
                  <button
                    type="button"
                    onClick={() => void loadAlternatives()}
                    className={`${SECONDARY_BUTTON} w-full`}
                  >
                    Reintentar
                  </button>
                </>
              ) : null}
              {slotState === 'ready' && dates.length === 0 ? (
                <>
                  <p>No hay otros horarios disponibles.</p>
                  <BookingContact business={result.business} />
                </>
              ) : null}
              {slotState === 'ready' && dates.length > 0 ? (
                <>
                  {calendar ? (
                    <AppointmentCalendar
                      dates={dates}
                      selectedDate={selectedDate}
                      chooseDate={chooseDate}
                    />
                  ) : (
                    <AppointmentDayStrip
                      dates={dates}
                      selectedDate={selectedDate}
                      chooseDate={chooseDate}
                    />
                  )}
                  <AppointmentTimes
                    slots={grouped.get(selectedDate) ?? []}
                    selected={startsAt}
                    onSelect={(slot) => setStartsAt(slot.startsAt)}
                  />
                  <button
                    type="button"
                    onClick={() => setCalendar(!calendar)}
                    aria-expanded={calendar}
                    className={LINK}
                  >
                    {calendar ? 'Cerrar calendario' : 'Ver calendario'}
                  </button>
                  <button
                    type="button"
                    disabled={pending || !startsAt}
                    onClick={() => void update({ action: 'reschedule', startsAt })}
                    className={`${PRIMARY_BUTTON} w-full`}
                  >
                    {pending ? 'Guardando…' : 'Solicitar nuevo horario'}
                  </button>
                </>
              ) : null}
              <button
                type="button"
                disabled={pending}
                onClick={() => goTo('summary')}
                className={`${SECONDARY_BUTTON} w-full`}
              >
                Volver a mi cita
              </button>
            </>
          ) : null}
        </section>
      ) : null}
    </BookingShell>
  )
}

import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  createPublicAppointment,
  fetchPublicAppointmentPage,
  fetchPublicAppointmentSlots,
} from '../../api/publicAppointments'
import type {
  AppointmentSlot,
  PublicAppointment,
  PublicAppointmentPayload,
  PublicBookingPage,
} from '../../api/publicAppointments'
import { isValidChileMobile } from '../../utils/chilePhone.js'
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
import AppointmentGalleryCarousel from './AppointmentGalleryCarousel'
import AppointmentLocationSection from './AppointmentLocationSection'
import { formatDateLabel } from './appointmentBookingCalendar'
import PublicAppointmentManagement from './PublicAppointmentManagement'

const FIELDS = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  customerEmail: '',
  notes: '',
  contactConsent: false,
}
type BookingFields = typeof FIELDS
type FieldErrors = Partial<Record<keyof BookingFields, string>>
type LoadState = 'loading' | 'ready' | 'error'
type BookingResult = {
  appointment: PublicAppointment
  managementToken?: string
  timezone?: string
}

const HEADING = 'mb-2 font-display text-3xl font-bold leading-tight text-dark focus:outline-none'
const FIELD_CLASS =
  'min-h-12 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base text-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#086941] aria-[invalid=true]:border-red-600'
const ERROR_CLASS = 'mt-1 text-sm text-red-700'
const LINK_CLASS = 'font-semibold text-[#086941] underline underline-offset-4 hover:no-underline'

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length > 9 && digits.startsWith('56')) return digits.slice(2, 11)
  return digits.slice(0, 9)
}

function validateFields(fields: BookingFields, emailRequired: boolean): FieldErrors {
  const errors: FieldErrors = {}
  if (!fields.firstName.trim()) errors.firstName = 'Ingresa tu nombre.'
  if (!fields.lastName.trim()) errors.lastName = 'Ingresa tu apellido.'
  if (!isValidChileMobile(fields.phoneNumber)) {
    errors.phoneNumber = 'Ingresa 9 dígitos. El celular debe comenzar con 9.'
  }
  const email = fields.customerEmail.trim()
  if (emailRequired && !email) errors.customerEmail = 'Ingresa tu correo.'
  else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.customerEmail = 'Ingresa un correo válido.'
  }
  if (!fields.contactConsent)
    errors.contactConsent = 'Autoriza el contacto para enviar tu solicitud.'
  return errors
}

function BookingForm({ businessId }: { businessId: string }) {
  const [page, setPage] = useState<PublicBookingPage | null>(null)
  const [pageState, setPageState] = useState<LoadState>('loading')
  const [slotState, setSlotState] = useState<LoadState>('loading')
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [slotsTimezone, setSlotsTimezone] = useState<string>()
  const [selectedDate, setSelectedDate] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [view, setView] = useState<'schedule' | 'details'>('schedule')
  const [calendar, setCalendar] = useState(false)
  const [conflict, setConflict] = useState(false)
  const [fields, setFields] = useState(FIELDS)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<BookingResult | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const headingFocus = useRef(false)
  const request = useRef<{ signature: string; id: string }>(null)
  const load = useRef<AbortController | null>(null)
  const submitInProgress = useRef(false)

  const reloadSlots = useCallback(
    async (signal?: AbortSignal) => {
      setSlotState('loading')
      try {
        const response = await fetchPublicAppointmentSlots(businessId, signal)
        if (signal?.aborted) return
        setSlots(response.data.slots ?? [])
        setSlotsTimezone(response.data.timezone)
        const dates = [...groupAppointmentSlots(response.data.slots ?? []).keys()]
        setSelectedDate((previous) => (dates.includes(previous) ? previous : (dates[0] ?? '')))
        setSlotState('ready')
      } catch {
        if (signal?.aborted) return
        setSlots([])
        setSlotState('error')
      }
    },
    [businessId],
  )

  const reloadPage = useCallback(async () => {
    load.current?.abort()
    const controller = new AbortController()
    load.current = controller
    setPageState('loading')
    try {
      const response = await fetchPublicAppointmentPage(businessId, controller.signal)
      if (controller.signal.aborted) return
      setPage(response.data)
      setPageState('ready')
      if (response.data.available) await reloadSlots(controller.signal)
    } catch {
      if (!controller.signal.aborted) setPageState('error')
    }
  }, [businessId, reloadSlots])

  useEffect(() => {
    void reloadPage()
    return () => load.current?.abort()
  }, [reloadPage])

  useEffect(() => {
    document.title = page?.business?.name
      ? `Agendar cita | ${page.business.name}`
      : 'Agendar cita | AppsFly'
  }, [page?.business?.name])

  useEffect(() => {
    if (headingFocus.current) {
      headingFocus.current = false
      heading.current?.focus()
    }
  }, [view, result])

  const timezone = result?.timezone || page?.timezone || slotsTimezone || BOOKING_TIMEZONE
  const grouped = useMemo(() => groupAppointmentSlots(slots), [slots])
  const dates = [...grouped.keys()]
  const daySlots = grouped.get(selectedDate) ?? []
  const chosen = daySlots.find((slot) => slot.startsAt === startsAt)
  const business = page?.business
  const getFieldId = (field: keyof BookingFields) => `booking-${field}`

  function selectDate(date: string) {
    if (date !== selectedDate) {
      setSelectedDate(date)
      setStartsAt('')
    }
  }

  function openDetails() {
    if (!chosen || slotState !== 'ready') return
    setSubmitError('')
    setConflict(false)
    setCalendar(false)
    headingFocus.current = true
    setView('details')
  }

  function goToSchedule() {
    setSubmitError('')
    headingFocus.current = true
    setView('schedule')
  }

  function updateField<K extends keyof BookingFields>(name: K, value: BookingFields[K]) {
    setFields((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: undefined }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!chosen || slotState !== 'ready' || submitInProgress.current) return
    setSubmitError('')
    const validation = validateFields(fields, Boolean(page?.emailRequired))
    setErrors(validation)
    const firstInvalid = Object.keys(validation)[0] as keyof BookingFields | undefined
    if (firstInvalid) {
      document.getElementById(getFieldId(firstInvalid))?.focus()
      return
    }

    const payload: PublicAppointmentPayload = {
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      phoneCode: '+56',
      phoneNumber: fields.phoneNumber,
      contactConsent: true,
      customerEmail: fields.customerEmail.trim() || null,
      startsAt,
      notes: fields.notes.trim() || null,
    }
    const signature = JSON.stringify(payload)
    if (request.current?.signature !== signature) {
      request.current = { signature, id: crypto.randomUUID() }
    }

    submitInProgress.current = true
    setSending(true)
    try {
      const response = await createPublicAppointment(businessId, {
        ...payload,
        clientRequestId: request.current.id,
      })
      headingFocus.current = true
      setResult(response.data)
    } catch (error) {
      const http = axios.isAxiosError<{ code?: string }>(error) ? error.response : undefined
      if (http?.status === 409 && (http.data?.code === 'SLOT_UNAVAILABLE' || !http.data?.code)) {
        setStartsAt('')
        setCalendar(false)
        setConflict(true)
        goToSchedule()
        await reloadSlots(load.current?.signal)
      } else if (http?.status === 400 && http.data?.code === 'CUSTOMER_EMAIL_REQUIRED') {
        setErrors({ customerEmail: 'Ingresa tu correo para recibir el aviso.' })
        document.getElementById(getFieldId('customerEmail'))?.focus()
      } else {
        setSubmitError('No pudimos enviar la solicitud. Reintenta desde esta pantalla.')
      }
    } finally {
      submitInProgress.current = false
      setSending(false)
    }
  }

  function field({
    name,
    label,
    type = 'text',
    autoComplete,
    maxLength,
  }: {
    name: 'firstName' | 'lastName' | 'phoneNumber' | 'customerEmail'
    label: string
    type?: 'text' | 'tel' | 'email'
    autoComplete: string
    maxLength: number
  }) {
    const id = getFieldId(name)
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-dark">
          {label}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={fields[name]}
          onChange={(event) =>
            updateField(
              name,
              name === 'phoneNumber' ? normalizePhone(event.target.value) : event.target.value,
            )
          }
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${id}-error` : undefined}
          className={FIELD_CLASS}
          required={name !== 'customerEmail' || page?.emailRequired}
        />
        {errors[name] ? (
          <p id={`${id}-error`} className={ERROR_CLASS}>
            {errors[name]}
          </p>
        ) : null}
      </div>
    )
  }

  const aside =
    page?.available &&
    !result &&
    view === 'schedule' &&
    (page.galleryImageUrls?.length || page.location) ? (
      <>
        {page.galleryImageUrls?.length ? (
          <AppointmentGalleryCarousel
            imageUrls={page.galleryImageUrls}
            alt={`Local de ${business?.name ?? 'atención'}`}
            className="h-40 lg:h-56"
          />
        ) : null}
        {page.location ? (
          <div className="p-5">
            <AppointmentLocationSection location={page.location} />
          </div>
        ) : null}
      </>
    ) : undefined

  return (
    <BookingShell business={business} aside={aside}>
      {pageState === 'loading' ? <p role="status">Cargando agenda…</p> : null}
      {pageState === 'error' ? (
        <div className="space-y-4">
          <h1 className={HEADING}>No pudimos cargar la agenda</h1>
          <button
            type="button"
            onClick={() => void reloadPage()}
            className={`${PRIMARY_BUTTON} w-full`}
          >
            Reintentar
          </button>
          <BookingContact business={business} />
        </div>
      ) : null}
      {pageState === 'ready' && !page?.available ? (
        <div className="space-y-4">
          <h1 className={HEADING}>Agendamiento no disponible</h1>
          <p>{page?.message || 'La agenda del negocio no está disponible en este momento.'}</p>
          <BookingContact business={business} />
        </div>
      ) : null}
      {pageState === 'ready' && page?.available && result ? (
        <section className="space-y-5">
          <div className="space-y-2 text-center">
            <FaCheckCircle aria-hidden="true" className="mx-auto mb-4 size-12 text-[#086941]" />
            <h1 ref={heading} tabIndex={-1} className={HEADING}>
              Solicitud enviada
            </h1>
            <AppointmentStatusLabel status={result.appointment.status} />
          </div>
          <BookingSummary
            startsAt={result.appointment.startsAt}
            timezone={timezone}
            duration={page.slotDurationMinutes}
          />
          {page.location?.mapsUrl ? (
            <a
              href={page.location.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className={`${PRIMARY_BUTTON} w-full`}
            >
              Ver ubicación
            </a>
          ) : (
            <AppointmentLocationSection location={page.location} compact />
          )}
          {result.managementToken ? (
            <Link
              to={{ hash: `gestionar=${encodeURIComponent(result.managementToken)}` }}
              className={`${SECONDARY_BUTTON} w-full`}
            >
              Gestionar solicitud
            </Link>
          ) : null}
          <p className="text-center text-sm text-slate-600">
            {result.appointment.customerEmail
              ? 'Te avisaremos por correo cuando se confirme.'
              : 'El negocio podrá contactarte al celular que ingresaste.'}
          </p>
        </section>
      ) : null}
      {pageState === 'ready' && page?.available && !result && view === 'schedule' ? (
        <section className="space-y-4">
          <h1 ref={heading} tabIndex={-1} className={HEADING}>
            Elige tu horario
          </h1>
          {page.slotDurationMinutes ? (
            <p className="text-sm text-slate-600">
              Duración de la cita · {page.slotDurationMinutes} min
            </p>
          ) : null}
          {conflict ? (
            <div role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-amber-950">
              <p className="font-semibold">El horario ya se ocupó</p>
              <p className="mt-1 text-sm">Conservamos tus datos. Elige otra hora para continuar.</p>
            </div>
          ) : null}
          {slotState === 'loading' ? <p role="status">Cargando horarios…</p> : null}
          {slotState === 'error' ? (
            <div className="space-y-3">
              <p role="alert">No pudimos actualizar los horarios.</p>
              <button
                type="button"
                onClick={() => void reloadSlots(load.current?.signal)}
                className={`${PRIMARY_BUTTON} w-full`}
              >
                Reintentar
              </button>
              <BookingContact business={business} />
            </div>
          ) : null}
          {slotState === 'ready' && dates.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold">No hay horas disponibles</h2>
              <p className="text-sm text-slate-600">Consulta al negocio por nuevas horas.</p>
              <BookingContact business={business} />
            </div>
          ) : null}
          {slotState === 'ready' && dates.length > 0 ? (
            <>
              {!calendar ? (
                <AppointmentDayStrip
                  dates={dates}
                  selectedDate={selectedDate}
                  chooseDate={selectDate}
                />
              ) : null}
              {calendar ? (
                <AppointmentCalendar
                  dates={dates}
                  selectedDate={selectedDate}
                  chooseDate={selectDate}
                />
              ) : null}
              <p className="text-sm font-semibold text-slate-700 first-letter:uppercase">
                {conflict ? 'Otras horas para ' : ''}
                {formatDateLabel(selectedDate)}
              </p>
              <AppointmentTimes
                slots={daySlots}
                selected={startsAt}
                onSelect={(slot) => setStartsAt(slot.startsAt)}
              />
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCalendar(!calendar)}
                  aria-expanded={calendar}
                  aria-controls="booking-calendar"
                  className={`${LINK_CLASS} min-h-11`}
                >
                  {calendar ? 'Cerrar calendario' : 'Ver calendario'}
                </button>
              </div>
              <button
                type="button"
                onClick={openDetails}
                disabled={!chosen}
                className={`${PRIMARY_BUTTON} w-full`}
              >
                {conflict ? 'Usar esta hora' : 'Continuar'}
              </button>
            </>
          ) : null}
          {page.visitorMessage ? (
            <p className="text-sm leading-relaxed text-slate-600">{page.visitorMessage}</p>
          ) : null}
        </section>
      ) : null}
      {pageState === 'ready' && page?.available && !result && view === 'details' && chosen ? (
        <form onSubmit={submit} noValidate className="space-y-4">
          <h1 ref={heading} tabIndex={-1} className={HEADING}>
            Tus datos
          </h1>
          <BookingSummary
            startsAt={startsAt}
            timezone={timezone}
            duration={page.slotDurationMinutes}
          >
            <button
              type="button"
              onClick={goToSchedule}
              disabled={sending}
              className={`${LINK_CLASS} mt-1 text-sm`}
            >
              Cambiar horario
            </button>
          </BookingSummary>
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="sr-only">Nombre y apellido</legend>
            {field({
              name: 'firstName',
              label: 'Nombre',
              autoComplete: 'given-name',
              maxLength: 80,
            })}
            {field({
              name: 'lastName',
              label: 'Apellido',
              autoComplete: 'family-name',
              maxLength: 80,
            })}
          </fieldset>
          {field({
            name: 'phoneNumber',
            label: 'Celular',
            type: 'tel',
            autoComplete: 'tel-national',
            maxLength: 20,
          })}
          {page.customerNotificationsEnabled || page.emailRequired ? (
            <>
              {field({
                name: 'customerEmail',
                label: page.emailRequired ? 'Correo' : 'Correo (opcional)',
                type: 'email',
                autoComplete: 'email',
                maxLength: 120,
              })}
              <p className="-mt-2 text-sm text-slate-600">
                {page.emailRequired
                  ? 'Te avisaremos por correo.'
                  : 'Si ingresas un correo, te avisaremos por ese medio.'}
              </p>
            </>
          ) : null}
          <details open={fields.notes ? true : undefined} className="text-sm">
            <summary className={`${LINK_CLASS} inline-flex min-h-11 cursor-pointer items-center`}>
              Agregar un comentario
            </summary>
            <label htmlFor={getFieldId('notes')} className="sr-only">
              Comentario opcional
            </label>
            <textarea
              id={getFieldId('notes')}
              name="notes"
              value={fields.notes}
              rows={3}
              maxLength={500}
              onChange={(event) => updateField('notes', event.target.value)}
              className={`${FIELD_CLASS} mt-1`}
            />
          </details>
          <div>
            <label className="flex min-h-11 items-start gap-3 text-sm text-slate-700">
              <input
                id={getFieldId('contactConsent')}
                name="contactConsent"
                type="checkbox"
                checked={fields.contactConsent}
                onChange={(event) => updateField('contactConsent', event.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-[#086941]"
                aria-invalid={Boolean(errors.contactConsent)}
                aria-describedby={
                  errors.contactConsent ? 'booking-contactConsent-error' : undefined
                }
                required
              />
              Autorizo a {business?.name || 'este negocio'} a contactarme por esta cita.
            </label>
            {errors.contactConsent ? (
              <p id="booking-contactConsent-error" className={ERROR_CLASS}>
                {errors.contactConsent}
              </p>
            ) : null}
          </div>
          {submitError ? (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {submitError}
            </p>
          ) : null}
          <button type="submit" disabled={sending} className={`${PRIMARY_BUTTON} w-full`}>
            {sending ? 'Enviando…' : 'Solicitar cita'}
          </button>
          <p className="text-center text-sm text-slate-600">El negocio confirmará la hora.</p>
        </form>
      ) : null}
    </BookingShell>
  )
}

export default function PublicRegisterAppointmentPage() {
  const { businessId } = useParams()
  const { hash } = useLocation()
  const managementToken = new URLSearchParams(hash.slice(1)).get('gestionar')
  if (!businessId)
    return (
      <BookingShell>
        <h1 className={HEADING}>Enlace inválido</h1>
      </BookingShell>
    )
  if (managementToken) {
    return (
      <PublicAppointmentManagement
        key={`${businessId}:${managementToken}`}
        businessId={businessId}
        token={managementToken}
      />
    )
  }
  return <BookingForm key={businessId} businessId={businessId} />
}

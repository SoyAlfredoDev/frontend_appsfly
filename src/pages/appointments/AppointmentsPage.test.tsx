import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { confirm, notify, writeClipboard } = vi.hoisted(() => ({
  confirm: vi.fn(),
  notify: { error: vi.fn(), success: vi.fn() },
  writeClipboard: vi.fn(),
}))

const authState = {
  loadingAuth: false,
  activeBusinessId: 'biz',
  subscriptions: [] as Array<{
    subscriptionPlanId: string
    subscriptionStatus: string
    subscriptionEndDate: string
  }>,
}

vi.mock('../../context/authContext.jsx', () => ({
  useAuth: () => authState,
}))

vi.mock('../../context/ToastContext.jsx', () => ({
  useToast: () => notify,
}))

vi.mock('../../context/ConfirmationContext.jsx', () => ({
  useConfirm: () => confirm,
}))

vi.mock('../../api/appointments.js', () => ({
  getAppointmentSettings: vi.fn(),
  getAppointments: vi.fn(),
  getTenantAppointmentSlots: vi.fn(),
  patchAppointment: vi.fn(),
  updateAppointmentSettings: vi.fn(),
}))

import AppointmentsPage from './AppointmentsPage.jsx'
import {
  getAppointmentSettings,
  getAppointments,
  getTenantAppointmentSlots,
  patchAppointment,
  updateAppointmentSettings,
} from '../../api/appointments.js'

const weeklyAvailability = [{ dayOfWeek: 1, startTime: '09:00', endTime: '13:00' }]
const settings = {
  appointmentsEnabled: true,
  publicLink: 'https://appsfly.cl/registarcita/biz',
  weeklyAvailability,
  slotDurationMinutes: 30,
  maxConcurrentPerSlot: 1,
  maxDaysAhead: 30,
  customerNotificationsEnabled: false,
  visitorMessage: '',
  timezone: 'America/Santiago',
}

function signedIn(planId: string) {
  authState.subscriptions = [
    {
      subscriptionPlanId: planId,
      subscriptionStatus: 'ACTIVE',
      subscriptionEndDate: '2100-01-01T00:00:00.000Z',
    },
  ]
  render(
    <MemoryRouter>
      <AppointmentsPage />
    </MemoryRouter>,
  )
}

function appointment(id: string, firstName: string, startsAt: string, status: string) {
  return { appointmentId: id, firstName, lastName: 'Prueba', startsAt, status }
}

describe('AppointmentsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    authState.loadingAuth = false
    authState.subscriptions = []
    confirm.mockResolvedValue(true)
    writeClipboard.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeClipboard },
    })
    vi.mocked(getAppointmentSettings).mockResolvedValue({ data: { settings } } as never)
    vi.mocked(getAppointments).mockResolvedValue({ data: { appointments: [] } } as never)
  })

  it('explains the module and asks Start to upgrade', () => {
    signedIn('P005')

    expect(screen.getByRole('heading', { name: 'Qué puedes hacer con Citas' })).toBeInTheDocument()
    expect(screen.getByText(/prueba y en Pro/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mejorar plan' })).toHaveAttribute(
      'href',
      '/configuration/subscription',
    )
    expect(screen.queryByRole('button', { name: 'Copiar enlace' })).not.toBeInTheDocument()
    expect(getAppointmentSettings).not.toHaveBeenCalled()
  })

  it('previews and copies the saved public link for the commercial plan', async () => {
    signedIn('P002')

    expect(await screen.findByRole('link', { name: 'Vista previa' })).toHaveAttribute(
      'href',
      settings.publicLink,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }))
    await waitFor(() => expect(writeClipboard).toHaveBeenCalledWith(settings.publicLink))

    fireEvent.click(screen.getByRole('button', { name: 'Configuración' }))
    expect(await screen.findByRole('heading', { name: 'Tu agenda está habilitada' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Habilitar citas' })).toBeInTheDocument()
    expect(screen.getByText('Citas en el mismo horario')).toBeInTheDocument()
  })

  it('offers the activation checklist until the business saves hours and activates the agenda', async () => {
    vi.mocked(getAppointmentSettings).mockResolvedValueOnce({
      data: { settings: { ...settings, weeklyAvailability: [], appointmentsEnabled: false } },
    } as never)
    vi.mocked(updateAppointmentSettings).mockResolvedValueOnce({ data: { settings } } as never)
    signedIn('P006')

    fireEvent.click(await screen.findByRole('button', { name: 'Configurar agenda' }))
    expect(
      screen.getByRole('heading', { name: 'Prepara tu agenda para recibir citas' }),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: /Agregar franja/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Activo' }))
    expect(screen.queryByRole('link', { name: 'Vista previa' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Guardar configuración' }))

    expect(await screen.findByRole('link', { name: 'Vista previa' })).toBeVisible()
    expect(updateAppointmentSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentsEnabled: true,
        weeklyAvailability: [expect.objectContaining({ dayOfWeek: 1 })],
      }),
    )
  })

  it('shows pending requests and appointments today before later and earlier active appointments', async () => {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const entries = [
      appointment('past', 'Anterior', new Date(now - 2 * day).toISOString(), 'CONFIRMED'),
      appointment('today', 'Hoy', new Date(now).toISOString(), 'CONFIRMED'),
      appointment('future', 'Próxima', new Date(now + 2 * day).toISOString(), 'RESCHEDULED'),
      appointment('pending', 'Pendiente', '2026-01-05T16:00:00.000Z', 'PENDING'),
    ]
    vi.mocked(getAppointments).mockResolvedValue({ data: { appointments: entries } } as never)
    signedIn('P006')

    const pending = await screen.findByRole('heading', { name: 'Solicitudes pendientes' })
    const today = screen.getByRole('heading', { name: 'Citas de hoy' })
    const upcoming = screen.getByRole('heading', { name: 'Próximas citas' })
    const past = screen.getByRole('heading', { name: 'Citas anteriores' })
    expect(pending.compareDocumentPosition(today) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(today.compareDocumentPosition(upcoming) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(upcoming.compareDocumentPosition(past) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(pending.parentElement!).getByText(/13:00/)).toBeInTheDocument()
  })

  it('lets the business retry instead of showing an empty agenda on a list error', async () => {
    vi.mocked(getAppointments).mockRejectedValueOnce(new Error('unavailable'))
    signedIn('P006')

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las citas.')
    expect(screen.queryByText('No hay citas en este filtro.')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar citas' }))
    expect(await screen.findByText('No hay citas en este filtro.')).toBeVisible()
  })

  it('moves a booking only after reviewing and confirming the new time', async () => {
    const original = '2099-06-01T14:00:00.000Z'
    const replacement = '2099-06-01T15:00:00.000Z'
    vi.mocked(getAppointments).mockResolvedValue({
      data: { appointments: [appointment('appt', 'Ana', original, 'CONFIRMED')] },
    } as never)
    vi.mocked(getTenantAppointmentSlots).mockResolvedValue({
      data: { slots: [{ startsAt: original }, { startsAt: replacement }] },
    } as never)
    vi.mocked(patchAppointment).mockResolvedValue({ data: {} } as never)
    confirm.mockResolvedValueOnce(false)
    signedIn('P006')

    fireEvent.click(await screen.findByRole('button', { name: 'Modificar horario' }))
    expect(getTenantAppointmentSlots).toHaveBeenCalledWith({ excludeAppointmentId: 'appt' })
    expect(await screen.findByRole('button', { name: 'Revisar cambio' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /10:00/ })).not.toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: /11:00/ }))
    expect(patchAppointment).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Revisar cambio' }))
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1))
    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/Ana Prueba.*10:00.*11:00/),
        confirmText: 'Reagendar cita',
      }),
    )
    expect(patchAppointment).not.toHaveBeenCalled()
    const review = screen.getByRole('button', { name: 'Revisar cambio' })
    await waitFor(() => expect(review).toBeEnabled())
    fireEvent.click(review)
    await waitFor(() =>
      expect(patchAppointment).toHaveBeenCalledWith('appt', { startsAt: replacement }),
    )
  })

  it('refreshes choices and clears the selection when another client took the new time', async () => {
    const original = '2099-06-01T14:00:00.000Z'
    const occupied = '2099-06-01T15:00:00.000Z'
    const newSlot = '2099-06-01T16:00:00.000Z'
    vi.mocked(getAppointments).mockResolvedValue({
      data: { appointments: [appointment('appt', 'Ana', original, 'CONFIRMED')] },
    } as never)
    vi.mocked(getTenantAppointmentSlots)
      .mockResolvedValueOnce({ data: { slots: [{ startsAt: occupied }] } } as never)
      .mockResolvedValueOnce({ data: { slots: [{ startsAt: newSlot }] } } as never)
    vi.mocked(patchAppointment).mockRejectedValueOnce({ response: { status: 409 } })
    signedIn('P006')

    fireEvent.click(await screen.findByRole('button', { name: 'Modificar horario' }))
    fireEvent.click(await screen.findByRole('button', { name: /11:00/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Revisar cambio' }))

    expect(await screen.findByRole('button', { name: /12:00/ })).toBeVisible()
    expect(screen.queryByRole('button', { name: /11:00/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revisar cambio' })).toBeDisabled()
    expect(getTenantAppointmentSlots).toHaveBeenCalledTimes(2)
  })
})

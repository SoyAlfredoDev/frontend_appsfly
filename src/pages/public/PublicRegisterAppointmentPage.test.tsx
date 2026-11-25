import type { AxiosResponse } from 'axios'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  changeManagedAppointment,
  createPublicAppointment,
  fetchManagedAppointment,
  fetchPublicAppointmentPage,
  fetchPublicAppointmentSlots,
} from '../../api/publicAppointments'
import type {
  AppointmentSlot,
  ManagedAppointment,
  PublicBookingPage,
} from '../../api/publicAppointments'
import PublicRegisterAppointmentPage from './PublicRegisterAppointmentPage'

vi.mock('../../api/publicAppointments', () => ({
  fetchPublicAppointmentPage: vi.fn(),
  fetchPublicAppointmentSlots: vi.fn(),
  createPublicAppointment: vi.fn(),
  fetchManagedAppointment: vi.fn(),
  changeManagedAppointment: vi.fn(),
}))

const monday = { dateKey: '2026-10-05', startsAt: '2026-10-05T12:00:00.000Z', label: '09:00' }
const later = { dateKey: '2026-10-05', startsAt: '2026-10-05T12:30:00.000Z', label: '09:30' }
const november = { dateKey: '2026-11-02', startsAt: '2026-11-02T16:00:00.000Z', label: '13:00' }
const managed: ManagedAppointment = {
  appointment: { appointmentId: 'appointment-1', status: 'PENDING', startsAt: monday.startsAt },
  timezone: 'America/Santiago',
  business: { name: 'Óptica Norte' },
  canCancel: true,
  canReschedule: true,
}
const page: PublicBookingPage = {
  available: true,
  timezone: 'America/Santiago',
  business: { name: 'Óptica Norte', phone: '+56 9 1111 1111' },
  customerNotificationsEnabled: true,
  slotDurationMinutes: 30,
  galleryImageUrls: ['https://cdn.example.com/local.jpg'],
  location: {
    address: 'Av. Providencia 1234, Santiago',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Providencia%201234',
  },
}

const response = <T,>(data: T) => ({ data }) as AxiosResponse<T>
const slotsResponse = (slots: AppointmentSlot[]) =>
  response({ slots, timezone: 'America/Santiago' })

function renderPage(path = '/registarcita/biz-1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/registarcita/:businessId" element={<PublicRegisterAppointmentPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

type User = ReturnType<typeof userEvent.setup>

async function pickMonday(user: User) {
  await user.click(await screen.findByRole('button', { name: '09:00' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  expect(screen.getByRole('heading', { name: 'Tus datos' })).toHaveFocus()
}

async function fillDetails(user: User) {
  await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Ana')
  await user.type(screen.getByRole('textbox', { name: 'Apellido' }), 'Soto')
  await user.type(screen.getByRole('textbox', { name: 'Celular' }), '912345678')
  await user.click(screen.getByRole('checkbox', { name: /Autorizo/ }))
}

describe('PublicRegisterAppointmentPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(fetchPublicAppointmentPage).mockResolvedValue(response(page))
    vi.mocked(fetchPublicAppointmentSlots).mockResolvedValue(
      slotsResponse([monday, later, november]),
    )
    vi.mocked(createPublicAppointment).mockResolvedValue(
      response({
        appointment: managed.appointment,
        managementToken: 'token-demo',
        timezone: 'America/Santiago',
      }),
    )
    vi.mocked(fetchManagedAppointment).mockResolvedValue(response(managed))
  })

  it('shows hours before the gallery and synchronizes the expanded calendar with the selected day', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByRole('button', { name: '09:00' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'lunes 5 de octubre' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      within(screen.getByRole('complementary')).getByRole('img', { name: 'Local de Óptica Norte' }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: '09:00' }))
    await user.click(screen.getByRole('button', { name: 'Ver calendario' }))
    await user.click(screen.getByRole('button', { name: 'Mes siguiente' }))
    expect(screen.getByRole('button', { name: 'lunes 2 de noviembre' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: '13:00' })).toBeVisible()
    expect(screen.queryByRole('button', { name: '09:00' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('moves focus to the first invalid field and submits without email in the compact form', async () => {
    const user = userEvent.setup()
    renderPage()
    await pickMonday(user)
    await user.click(screen.getByRole('button', { name: 'Solicitar cita' }))
    const first = screen.getByRole('textbox', { name: 'Nombre' })
    expect(first).toHaveFocus()
    expect(first).toHaveAccessibleDescription('Ingresa tu nombre.')
    expect(screen.getByRole('textbox', { name: 'Correo (opcional)' })).not.toBeRequired()
    await fillDetails(user)
    await user.click(screen.getByRole('button', { name: 'Solicitar cita' }))

    expect(await screen.findByRole('heading', { name: 'Solicitud enviada' })).toBeVisible()
    expect(screen.getByText('Pendiente de confirmación')).toBeVisible()
    expect(screen.getByText(/09:00/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'Gestionar solicitud' })).toHaveAttribute(
      'href',
      '/registarcita/biz-1#gestionar=token-demo',
    )
    expect(createPublicAppointment).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({
        firstName: 'Ana',
        lastName: 'Soto',
        phoneNumber: '912345678',
        customerEmail: null,
        clientRequestId: expect.any(String),
      }),
    )
  })

  it('supports a mandatory email policy if the server explicitly enables it', async () => {
    vi.mocked(fetchPublicAppointmentPage).mockResolvedValue(
      response({ ...page, emailRequired: true }),
    )
    const user = userEvent.setup()
    renderPage()
    await pickMonday(user)
    const email = screen.getByRole('textbox', { name: 'Correo' })
    expect(email).toBeRequired()
    await fillDetails(user)
    await user.click(screen.getByRole('button', { name: 'Solicitar cita' }))
    expect(email).toHaveFocus()
    expect(email).toHaveAccessibleDescription('Ingresa tu correo.')
    expect(createPublicAppointment).not.toHaveBeenCalled()
  })

  it('offers business contact when there are no open hours', async () => {
    vi.mocked(fetchPublicAppointmentSlots).mockResolvedValue(slotsResponse([]))
    renderPage()
    expect(await screen.findByRole('heading', { name: 'No hay horas disponibles' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Contactar al negocio' })).toHaveAttribute(
      'href',
      'tel:+56911111111',
    )
    expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument()
  })

  it('keeps details and clears the stale hour when a conflict is followed by a failed refresh', async () => {
    vi.mocked(createPublicAppointment).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 409, data: { code: 'SLOT_UNAVAILABLE' } },
    })
    vi.mocked(fetchPublicAppointmentSlots)
      .mockResolvedValueOnce(slotsResponse([monday]))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(slotsResponse([later]))
    const user = userEvent.setup()
    renderPage()
    await pickMonday(user)
    await fillDetails(user)

    await user.click(screen.getByRole('button', { name: 'Solicitar cita' }))
    expect(await screen.findByText('El horario ya se ocupó')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Reintentar' }))

    const replacement = await screen.findByRole('button', { name: '09:30' })
    expect(screen.queryByRole('button', { name: '09:00' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Usar esta hora' })).toBeDisabled()
    await user.click(replacement)
    await user.click(screen.getByRole('button', { name: 'Usar esta hora' }))
    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Ana')
    expect(screen.getByRole('textbox', { name: 'Celular' })).toHaveValue('912345678')
    expect(screen.getByText(/09:30/)).toBeVisible()
  })

  it('uses the same request id when retrying an unchanged submission', async () => {
    vi.mocked(createPublicAppointment).mockRejectedValueOnce(new Error('connection closed'))
    const user = userEvent.setup()
    renderPage()
    await pickMonday(user)
    await fillDetails(user)
    const submit = screen.getByRole('button', { name: 'Solicitar cita' })
    await user.click(submit)
    expect(await screen.findByRole('alert')).toHaveTextContent('Reintenta')
    await user.click(submit)
    await screen.findByRole('heading', { name: 'Solicitud enviada' })
    const requests = vi.mocked(createPublicAppointment).mock.calls
    expect(requests.map(([, payload]) => payload.clientRequestId)).toEqual([
      expect.any(String),
      requests[0][1].clientRequestId,
    ])
  })

  it('uses the private token to consult, reschedule, and cancel the appointment', async () => {
    vi.mocked(changeManagedAppointment)
      .mockResolvedValueOnce(
        response({ ...managed, appointment: { ...managed.appointment, startsAt: later.startsAt } }),
      )
      .mockResolvedValueOnce(
        response({
          ...managed,
          appointment: { ...managed.appointment, startsAt: later.startsAt, status: 'CANCELLED' },
          canReschedule: false,
          canCancel: false,
        }),
      )
    const user = userEvent.setup()
    renderPage('/registarcita/biz-1#gestionar=token-demo')
    expect(await screen.findByRole('heading', { name: 'Tu cita' })).toBeVisible()
    expect(fetchManagedAppointment).toHaveBeenCalledWith(
      'biz-1',
      'token-demo',
      expect.any(AbortSignal),
    )
    expect(fetchPublicAppointmentPage).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cambiar horario' }))
    await user.click(await screen.findByRole('button', { name: '09:30' }))
    expect(screen.queryByRole('button', { name: '09:00' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Solicitar nuevo horario' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('confirmar el nuevo horario'),
    )
    expect(changeManagedAppointment).toHaveBeenCalledWith('biz-1', 'token-demo', {
      action: 'reschedule',
      startsAt: later.startsAt,
    })

    await user.click(screen.getByRole('button', { name: 'Cancelar cita' }))
    expect(changeManagedAppointment).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Confirmar cancelación' }))
    expect(await screen.findByText('Cita cancelada')).toBeVisible()
    expect(changeManagedAppointment).toHaveBeenLastCalledWith('biz-1', 'token-demo', {
      action: 'cancel',
    })
    expect(screen.queryByRole('button', { name: 'Cambiar horario' })).not.toBeInTheDocument()
  })
})

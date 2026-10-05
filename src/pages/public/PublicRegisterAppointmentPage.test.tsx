import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../api/publicAppointments.js', () => ({
  fetchPublicAppointmentPage: vi.fn(),
  fetchPublicAppointmentSlots: vi.fn(),
  createPublicAppointment: vi.fn(),
}))

import PublicRegisterAppointmentPage from './PublicRegisterAppointmentPage.jsx'
import {
  createPublicAppointment,
  fetchPublicAppointmentPage,
  fetchPublicAppointmentSlots,
} from '../../api/publicAppointments.js'

const openSlots = {
  data: {
    slots: [
      { dateKey: '2026-10-05', startsAt: '2026-10-05T12:00:00.000Z', label: '09:00' },
      { dateKey: '2026-10-05', startsAt: '2026-10-05T12:30:00.000Z', label: '09:30' },
      { dateKey: '2026-10-06', startsAt: '2026-10-06T16:00:00.000Z', label: '13:00' },
    ],
  },
}

async function continueFromMonday(user: ReturnType<typeof userEvent.setup>) {
  const monday = await screen.findByRole('button', { name: 'lunes 5 de octubre' })
  await waitFor(() => expect(monday).toHaveAttribute('aria-pressed', 'true'))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Hora' }), '2026-10-05T12:00:00.000Z')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}

const page = {
  available: true,
  business: { name: 'Óptica Norte', phone: '+56 9 1111 1111' },
  visitorMessage: null,
  customerNotificationsEnabled: true,
  slotDurationMinutes: 30,
  maxDaysAhead: 30,
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/registarcita/biz-1']}>
      <Routes>
        <Route path="/registarcita/:businessId" element={<PublicRegisterAppointmentPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicRegisterAppointmentPage', () => {
  beforeEach(() => {
    vi.mocked(fetchPublicAppointmentSlots).mockResolvedValue({ data: { slots: [] } } as never)
  })

  it('asks for an email when the business sends appointment notices', async () => {
    vi.mocked(fetchPublicAppointmentPage).mockResolvedValue({
      data: { ...page, customerNotificationsEnabled: true },
    } as never)
    vi.mocked(fetchPublicAppointmentSlots).mockResolvedValue(openSlots as never)

    const user = userEvent.setup()
    renderPage()
    await continueFromMonday(user)

    expect(await screen.findByRole('textbox', { name: /Correo/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Solicitar cita' })).not.toBeInTheDocument()
  })

  it('hides the email field when notices are off', async () => {
    vi.mocked(fetchPublicAppointmentPage).mockResolvedValue({
      data: { ...page, customerNotificationsEnabled: false },
    } as never)
    vi.mocked(fetchPublicAppointmentSlots).mockResolvedValue(openSlots as never)

    const user = userEvent.setup()
    renderPage()
    await continueFromMonday(user)

    expect(await screen.findByRole('button', { name: 'Continuar' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Correo/ })).not.toBeInTheDocument()
  })

  it('lets the visitor pick an open day and then an hour', async () => {
    vi.mocked(fetchPublicAppointmentPage).mockResolvedValue({ data: page } as never)
    vi.mocked(fetchPublicAppointmentSlots).mockResolvedValue({
      data: {
        slots: [
          { dateKey: '2026-10-05', startsAt: '2026-10-05T12:00:00.000Z', label: '09:00' },
          { dateKey: '2026-10-05', startsAt: '2026-10-05T12:30:00.000Z', label: '09:30' },
          { dateKey: '2026-10-06', startsAt: '2026-10-06T16:00:00.000Z', label: '13:00' },
        ],
      },
    } as never)

    const user = userEvent.setup()
    renderPage()

    const monday = await screen.findByRole('button', { name: 'lunes 5 de octubre' })
    await waitFor(() => expect(monday).toHaveAttribute('aria-pressed', 'true'))
    expect(screen.getByRole('combobox', { name: 'Hora' })).toHaveValue('')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Hora' }), '2026-10-05T12:00:00.000Z')
    expect(screen.getByRole('combobox', { name: 'Hora' })).toHaveValue('2026-10-05T12:00:00.000Z')
    expect(screen.queryByRole('heading', { name: 'Tus datos' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'martes 6 de octubre' }))
    expect(screen.getByRole('combobox', { name: 'Hora' })).toHaveValue('')
    expect(screen.getByRole('option', { name: '13:00' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '09:00' })).not.toBeInTheDocument()
  })

  it('explains when the business has no open hours', async () => {
    vi.mocked(fetchPublicAppointmentPage).mockResolvedValue({ data: page } as never)

    renderPage()

    expect(await screen.findByText('No hay horarios disponibles por ahora. Intenta más tarde.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('walks from the schedule to the confirmation', async () => {
    vi.mocked(fetchPublicAppointmentPage).mockResolvedValue({ data: page } as never)
    vi.mocked(fetchPublicAppointmentSlots).mockResolvedValue(openSlots as never)
    vi.mocked(createPublicAppointment).mockResolvedValue({
      data: {
        appointment: {
          startsAt: '2026-10-05T12:00:00.000Z',
          phoneNumber: '912345678',
          customerEmail: 'ana@correo.cl',
        },
      },
    } as never)

    const user = userEvent.setup()
    renderPage()
    await continueFromMonday(user)

    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Ana')
    await user.type(screen.getByRole('textbox', { name: 'Apellido' }), 'Soto')
    await user.type(screen.getByRole('textbox', { name: /Celular/ }), '912345678')
    await user.type(screen.getByRole('textbox', { name: /Correo/ }), 'ana@correo.cl')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByRole('heading', { name: 'Confirma tu cita' })).toBeInTheDocument()
    expect(screen.getByText('Ana Soto')).toBeInTheDocument()
    expect(screen.getByText('09:00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Solicitar cita' }))
    expect(await screen.findByRole('heading', { name: 'Solicitud enviada' })).toBeInTheDocument()
  })
})

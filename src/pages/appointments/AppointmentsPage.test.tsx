import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = {
  loadingAuth: false,
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
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}))

vi.mock('../../context/ConfirmationContext.jsx', () => ({
  useConfirm: () => vi.fn(),
}))

vi.mock('../../api/appointments.js', () => ({
  getAppointmentSettings: vi.fn(),
  getAppointments: vi.fn(),
  getTenantAppointmentSlots: vi.fn(),
  patchAppointment: vi.fn(),
  updateAppointmentSettings: vi.fn(),
}))

import AppointmentsPage from './AppointmentsPage.jsx'
import { getAppointmentSettings, getAppointments } from '../../api/appointments.js'

describe('AppointmentsPage', () => {
  beforeEach(() => {
    authState.loadingAuth = false
    authState.subscriptions = []
    vi.mocked(getAppointmentSettings).mockResolvedValue({
      data: {
        settings: {
          appointmentsEnabled: true,
          publicLink: 'https://appsfly.cl/registarcita/biz',
          weeklyAvailability: [],
          slotDurationMinutes: 30,
          maxConcurrentPerSlot: 1,
          maxDaysAhead: 30,
          customerNotificationsEnabled: false,
          visitorMessage: '',
        },
      },
    } as never)
    vi.mocked(getAppointments).mockResolvedValue({ data: { appointments: [] } } as never)
  })

  it('explains the module and asks Start to upgrade', () => {
    authState.subscriptions = [
      {
        subscriptionPlanId: 'P005',
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: '2026-12-01T00:00:00.000Z',
      },
    ]

    render(
      <MemoryRouter>
        <AppointmentsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Qué puedes hacer con Citas' })).toBeInTheDocument()
    expect(screen.getByText(/prueba y en Pro/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mejorar plan' })).toHaveAttribute(
      'href',
      '/configuration/subscription',
    )
    expect(screen.queryByRole('button', { name: /Copiar link/ })).not.toBeInTheDocument()
    expect(getAppointmentSettings).not.toHaveBeenCalled()
  })

  it('opens the booking panel for the commercial plan', async () => {
    authState.subscriptions = [
      {
        subscriptionPlanId: 'P002',
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: '2026-12-01T00:00:00.000Z',
      },
    ]

    render(
      <MemoryRouter>
        <AppointmentsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: /Copiar link/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Configuración' }))
    expect(await screen.findByRole('heading', { name: 'Habilitar citas' })).toBeInTheDocument()
    expect(screen.getByText('Citas en el mismo horario')).toBeInTheDocument()
    await waitFor(() => {
      expect(getAppointments).toHaveBeenCalled()
    })
  })
})

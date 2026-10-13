import { render, screen, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: { user: { userId: 'user-a' }, activeBusinessId: 'tenant-a', loginSessionKey: 1 },
  customers: vi.fn(),
}))
vi.mock('../../context/authContext.jsx', () => ({ useAuth: () => mocks.auth }))
vi.mock('../../api/customers.js', () => ({
  getCustomers: mocks.customers,
  deleteCustomerById: vi.fn(),
}))
vi.mock('../ProtectedView.jsx', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('./SidebarNavigation.jsx', () => ({ default: () => null }))
vi.mock('../assistant/AssistantPanel.jsx', () => ({ default: () => null }))
vi.mock('../modals/AddCustomerModal.jsx', () => ({ default: () => null }))
vi.mock('../../context/ToastContext.jsx', () => ({ useToast: () => ({}) }))
vi.mock('../../context/ConfirmationContext.jsx', () => ({ useConfirm: () => vi.fn() }))
vi.mock('../../hooks/useTenantPermissions.js', () => ({ default: () => ({ can: () => false }) }))

import AppLayout from './AppLayout.jsx'
import CustomerPage from '../../pages/CustomerPage.jsx'

const customersA = {
  data: [{ customerId: 'a', customerFirstName: 'Cliente', customerLastName: 'Anterior' }],
}
function App() {
  return (
    <MemoryRouter initialEntries={['/customers']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/customers" element={<CustomerPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('mounted customer list isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth = { user: { userId: 'user-a' }, activeBusinessId: 'tenant-a', loginSessionKey: 1 }
  })

  it.each(['business', 'user'])(
    'discards previous customer names when the %s changes without refreshing',
    async (change) => {
      mocks.customers.mockResolvedValueOnce(customersA).mockResolvedValue({ data: [] })
      const view = render(<App />)
      await screen.findByText('Cliente Anterior')
      if (change === 'business') mocks.auth.activeBusinessId = 'tenant-b'
      else mocks.auth.user = { userId: 'user-b' }
      view.rerender(<App />)
      expect(screen.queryByText('Cliente Anterior')).not.toBeInTheDocument()
      await screen.findByText('No hay clientes registrados.')
      expect(mocks.customers).toHaveBeenCalledTimes(2)
    },
  )

  it('ignores an old customer response arriving after the new business has loaded', async () => {
    let finishOldRequest!: (value: typeof customersA) => void
    mocks.customers
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finishOldRequest = resolve
        }),
      )
      .mockResolvedValue({ data: [] })
    const view = render(<App />)
    await waitFor(() => expect(mocks.customers).toHaveBeenCalledTimes(1))
    mocks.auth.activeBusinessId = 'tenant-b'
    view.rerender(<App />)
    await screen.findByText('No hay clientes registrados.')
    await act(async () => finishOldRequest(customersA))
    expect(screen.queryByText('Cliente Anterior')).not.toBeInTheDocument()
    expect(screen.getByText('No hay clientes registrados.')).toBeInTheDocument()
  })
})

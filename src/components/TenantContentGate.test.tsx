import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const gateState = {
  loadingAuth: false,
  tenantAccessReady: true,
  blocked: false,
  subscriptionAccess: 'active',
}

vi.mock('../hooks/useTenantSubscriptionBlock.js', () => ({
  default: () => gateState,
}))

vi.mock('../pages/dashboard/SubscriptionWelcomePage.jsx', () => ({
  default: () => <div>Bienvenida</div>,
}))

vi.mock('../pages/dashboard/SubscriptionExpiredPage.jsx', () => ({
  default: () => <div>Expirada</div>,
}))

import TenantContentGate from './TenantContentGate.jsx'

function renderAtCustomers() {
  return render(
    <MemoryRouter initialEntries={['/customers']}>
      <Routes>
        <Route element={<TenantContentGate />}>
          <Route path="/customers" element={<h1>Clientes</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('TenantContentGate', () => {
  beforeEach(() => {
    gateState.loadingAuth = false
    gateState.tenantAccessReady = true
    gateState.blocked = false
    gateState.subscriptionAccess = 'active'
  })

  it('mounts the destination view as soon as access is ready', () => {
    renderAtCustomers()

    expect(screen.getByRole('heading', { name: 'Clientes' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Verificando acceso')).not.toBeInTheDocument()
  })

  it('keeps a page skeleton in the content area while access is still resolving', () => {
    gateState.tenantAccessReady = false

    renderAtCustomers()

    expect(screen.getByLabelText('Verificando acceso')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('heading', { name: 'Clientes' })).not.toBeInTheDocument()
  })
})

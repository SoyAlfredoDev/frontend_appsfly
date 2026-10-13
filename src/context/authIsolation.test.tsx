import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  verify: vi.fn(),
  memberships: vi.fn(),
  business: vi.fn(),
}))
vi.mock('../api/auth.js', () => ({
  loginRequest: mocks.login,
  logoutRequest: mocks.logout,
  authVerifyRequest: mocks.verify,
  registerRequest: vi.fn(),
}))
vi.mock('../api/userBusiness.js', () => ({ getUserBusinessById: mocks.memberships }))
vi.mock('../api/business.js', () => ({ getBusinessByIdRequest: mocks.business }))
vi.mock('../api/userGuest.js', () => ({
  getMyPendingInvitesRequest: vi.fn().mockResolvedValue({ data: [] }),
}))
vi.mock('../api/user.js', () => ({
  getUserByIdRequest: vi.fn().mockResolvedValue({ data: { userId: 'a' } }),
  userIsSuperAdminRequest: vi.fn().mockResolvedValue({ data: { isSuperAdmin: false } }),
}))
vi.mock('../api/subscription.js', () => ({
  getSubscriptionsByBusinessIdRequest: vi.fn().mockResolvedValue({ data: [] }),
}))
vi.mock('../announcements/announcementTriggers.ts', () => ({
  markLoginAnnouncementsPending: vi.fn(),
}))
import { AuthProvider, useAuth } from './authContext.jsx'
function Probe() {
  const auth = useAuth()
  return (
    <>
      <output>
        {auth.user?.userId ?? 'anonymous'}:{auth.activeBusinessId ?? 'no-tenant'}
      </output>
      <button onClick={() => auth.signin({})}>Login B</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </>
  )
}
describe('authentication tenant cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('token', 'a')
    mocks.verify.mockResolvedValue({ data: { id: 'a' } })
    mocks.memberships.mockImplementation(async (id) => ({
      data: id === 'a' ? [{ userBusinessBusinessId: 'tenant-a' }] : [],
    }))
    mocks.business.mockResolvedValue({ data: { businessId: 'tenant-a' } })
    mocks.login.mockResolvedValue({ data: { user: { userId: 'b' }, token: 'b' } })
    mocks.logout.mockRejectedValue(new Error('offline'))
  })
  it('clears the prior tenant when a new user has no businesses', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await screen.findByText('a:tenant-a')
    fireEvent.click(screen.getByRole('button', { name: 'Login B' }))
    await screen.findByText('b:no-tenant')
    expect(sessionStorage.getItem('appsfly_business_id')).toBeNull()
  })
  it('clears local identity even when server logout fails', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await screen.findByText('a:tenant-a')
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
    await waitFor(() => expect(screen.getByText('anonymous:no-tenant')).toBeInTheDocument())
    expect(localStorage.getItem('token')).toBeNull()
    expect(sessionStorage.getItem('appsfly_business_id')).toBeNull()
  })
})

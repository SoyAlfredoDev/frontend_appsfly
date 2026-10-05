import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isAnnouncementDismissedForever,
  resetAnnouncementStorageForTests,
} from '../announcements/announcementStorage'
import { AnnouncementProvider } from './AnnouncementContext.jsx'

const auth = vi.hoisted(() => ({
  isAuthenticated: true,
  loadingAuth: false,
  loginSessionKey: 1,
}))

vi.mock('./authContext.jsx', () => ({
  useAuth: () => auth,
}))

function installMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

function clearCookies() {
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0]?.trim()
    if (name) {
      document.cookie = `${name}=; Max-Age=0; Path=/`
    }
  })
}

function GoToSales() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate('/ventas')}>
      Ir a ventas
    </button>
  )
}

function renderProvider() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AnnouncementProvider>
        <GoToSales />
      </AnnouncementProvider>
    </MemoryRouter>,
  )
}

async function flushAnnouncementDelay() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(800)
  })
}

describe('AnnouncementProvider', () => {
  beforeEach(() => {
    installMatchMedia()
    auth.isAuthenticated = true
    auth.loadingAuth = false
    auth.loginSessionKey = 1
    localStorage.clear()
    sessionStorage.clear()
    resetAnnouncementStorageForTests()
    clearCookies()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does not open the publication again after the client hides it, even on the next login', async () => {
    const firstVisit = renderProvider()
    await flushAnnouncementDelay()

    expect(
      screen.getByRole('heading', { name: 'Lleva AppsFly en tu pantalla de inicio' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'No volver a mostrar este mensaje' }))
    await flushAnnouncementDelay()

    expect(isAnnouncementDismissedForever('pwa-install-v2')).toBe(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ir a ventas' }))
    await flushAnnouncementDelay()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    firstVisit.unmount()
    auth.loginSessionKey = 2
    renderProvider()
    await flushAnnouncementDelay()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the publication on the next login when the client only chooses Ahora no', async () => {
    const firstVisit = renderProvider()
    await flushAnnouncementDelay()

    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }))
    await flushAnnouncementDelay()
    expect(isAnnouncementDismissedForever('pwa-install-v2')).toBe(false)

    firstVisit.unmount()
    auth.loginSessionKey = 2
    renderProvider()
    await flushAnnouncementDelay()

    expect(
      screen.getByRole('heading', { name: 'Lleva AppsFly en tu pantalla de inicio' }),
    ).toBeInTheDocument()
  })
})

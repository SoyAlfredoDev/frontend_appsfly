import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../context/authContext.jsx', () => ({
  useAuth: () => ({
    signup: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('../context/ToastContext.jsx', () => ({
  useToast: () => ({
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

import RegisterPage from './RegisterPage.jsx'

describe('RegisterPage', () => {
  it('renders the registration form instead of crashing', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Crear cuenta nueva' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Regístrarme' })).toBeEnabled()
    expect(screen.getByRole('link', { name: 'Volver' })).toHaveAttribute('href', '/')
  })
})

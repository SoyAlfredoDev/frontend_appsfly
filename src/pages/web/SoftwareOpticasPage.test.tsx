import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SoftwareOpticasPage from './SoftwareOpticasPage'

describe('SoftwareOpticasPage', () => {
  it('opens with the answer a search engine can quote', () => {
    render(
      <MemoryRouter>
        <SoftwareOpticasPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Software para ópticas en Chile' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/receta OD\/OI/).length).toBeGreaterThan(0)
    expect(
      screen.getByRole('heading', { name: '¿Qué es un software para ópticas?' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Crear cuenta' }).length).toBeGreaterThan(0)
  })
})

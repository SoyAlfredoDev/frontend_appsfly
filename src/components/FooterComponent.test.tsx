import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Footer from './FooterComponent'

describe('Footer', () => {
  it('shows the legal company identity and public contact details', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )

    expect(screen.getByRole('region', { name: 'Datos de la empresa' })).toBeInTheDocument()
    expect(screen.getAllByText('TECNOLOGÍA Y SERVICIOS APPSFLY SPA').length).toBeGreaterThan(0)
    expect(screen.getByText('RUT 77.719.288-4')).toBeInTheDocument()
    expect(
      screen.getByText('Huérfanos 779, depto. 705, Santiago, Región Metropolitana'),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'appsfly.cl@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:appsfly.cl@gmail.com',
    )
    expect(screen.getByRole('link', { name: '+56 9 2162 9730' })).toHaveAttribute(
      'href',
      'tel:+56921629730',
    )
    expect(screen.getByRole('link', { name: 'WhatsApp +56 9 2162 9730' })).toHaveAttribute(
      'href',
      'https://wa.me/56921629730',
    )
  })
})

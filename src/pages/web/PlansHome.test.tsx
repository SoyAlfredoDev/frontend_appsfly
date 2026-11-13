import { render, screen, within, fireEvent } from '@testing-library/react'
import { MemoryRouter, type To } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PUBLIC_PLANS } from '../../config/publicPlans'
const api = vi.hoisted(() => vi.fn())
vi.mock('../../api/plans.js', () => ({ getPlansRequest: api }))
import PlansHome from './PlansHome'
const plans = PUBLIC_PLANS.map((p) => ({
  planId: p.id,
  planPrice: p.net,
  planDuration: p.months,
  planActive: true,
}))
function renderPlans(registerTo: To = '/register') {
  return render(
    <MemoryRouter>
      <PlansHome registerTo={registerTo} />
    </MemoryRouter>,
  )
}
beforeEach(() => {
  vi.resetAllMocks()
  api.mockResolvedValue({ data: plans })
})
describe('public plan selection', () => {
  it('clearly separates free months, net prices and total payable; signup never links to shared checkout', async () => {
    renderPlans()
    const trial = await screen.findByRole('article', { name: 'Prueba Pro' })
    expect(within(trial).getByText('por 2 meses')).toBeVisible()
    expect(within(trial).queryByText('/mes')).not.toBeInTheDocument()
    expect(screen.getByText('$29.738 al mes con IVA incluido')).toBeVisible()
    expect(screen.getByText('$47.588 al mes con IVA incluido')).toBeVisible()
    expect(screen.getByText(/requiere habilitar y configurar/)).toBeVisible()
    expect(screen.getByText(/Tienda de ropa: tallas, colores, SKU/)).toBeVisible()
    for (const link of screen.getAllByRole('link'))
      expect(link).toHaveAttribute('href', '/register')
  })
  it('keeps the optical registration destination', async () => {
    renderPlans({ pathname: '/register', search: '?source=optica' })
    expect(await screen.findByRole('link', { name: 'Probar 2 meses gratis' })).toHaveAttribute(
      'href',
      '/register?source=optica',
    )
  })
  it('shows loading without publishing fallback offers', () => {
    api.mockReturnValue(new Promise(() => {}))
    renderPlans()
    expect(screen.getByRole('status')).toHaveTextContent('Consultando')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })
  it('distinguishes an API failure from an empty catalog and supports retry', async () => {
    api.mockRejectedValueOnce(new Error('offline'))
    renderPlans()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos confirmar')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Volver a consultar' }))
    expect(await screen.findByRole('article', { name: 'Start' })).toBeVisible()
  })
  it('does not revive inactive plans when the response is empty', async () => {
    api.mockResolvedValue({ data: [] })
    renderPlans()
    expect(
      await screen.findByText(
        'No hay planes disponibles para nuevas activaciones en este momento.',
      ),
    ).toHaveAttribute('role', 'status')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })
})

import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage.jsx'
import { PUBLIC_PLANS } from '../config/publicPlans'
import { HOME_H1 } from '../seo/publicSeo'
vi.mock('../api/plans.js', () => ({
  getPlansRequest: vi.fn(async () => ({
    data: PUBLIC_PLANS.map((plan) => ({
      planId: plan.id,
      planPrice: plan.net,
      planDuration: plan.months,
      planActive: true,
    })),
  })),
}))

describe('honest public home', () => {
  it('shows the promised offer, demo, supported industries and plan conditions', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(HOME_H1)
    expect(screen.getByRole('link', { name: 'Ver cómo funciona' })).toHaveAttribute(
      'href',
      '#demostracion',
    )
    expect(screen.getByRole('heading', { name: 'Tienda de ropa' })).toBeVisible()
    expect(
      screen.queryByText(/dos factores|registra clientes, envía mensajes|cargas instantáneas/i),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/el administrador puede consultar/)).toBeVisible()
    expect(
      screen.getByText(/notificaciones automáticas de WhatsApp aún no están disponibles/),
    ).toBeVisible()
    expect(
      await within(screen.getByRole('region', { name: 'Planes de AppsFly' })).findByRole(
        'article',
        { name: 'Start' },
      ),
    ).toBeVisible()
    for (const link of screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('https://wa.me/')))
      expect(link.getAttribute('href')).toContain('56935784716')
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/appsfly.cl/',
    )
  })
})

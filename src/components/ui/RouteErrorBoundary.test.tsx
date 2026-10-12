import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import RouteErrorBoundary from './RouteErrorBoundary'

function BrokenClosureView(): ReactNode {
  throw new Error('daily sales render failed')
}

describe('RouteErrorBoundary', () => {
  it('shows an error instead of leaving the route blank', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <RouteErrorBoundary message="No se pudo mostrar los cierres diarios.">
        <BrokenClosureView />
      </RouteErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo mostrar los cierres diarios.')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})

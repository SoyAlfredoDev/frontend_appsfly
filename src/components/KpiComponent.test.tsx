import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import KpiComponent from './KpiComponent'

describe('KpiComponent', () => {
  it('renders an unavailable state instead of crashing for undefined values', () => {
    render(
      <KpiComponent
        title="Ventas del Día"
        icon={<span aria-hidden="true">$</span>}
        value={undefined}
        footer="Ventas realizadas hoy"
        loading={false}
        to={null}
        onClick={null}
      />,
    )

    expect(screen.getByText('Ventas del Día')).toBeInTheDocument()
    expect(screen.getByText('Ventas realizadas hoy')).toBeInTheDocument()
  })

  it('formats valid currency values in Chilean pesos', () => {
    render(
      <KpiComponent
        title="Ingresos"
        icon={<span aria-hidden="true">$</span>}
        value={19990}
        footer="Ingresos de hoy"
        loading={false}
        to={null}
        onClick={null}
      />,
    )

    expect(screen.getByText(/19[.,]990/)).toBeInTheDocument()
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProductTour from './ProductTour'

describe('public product tour', () => {
  it('switches screens and the full-size destination without requiring login', () => {
    render(<ProductTour />)
    expect(screen.getByRole('button', { name: /Registra la venta/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('img')).toHaveAttribute('src', '/hero/recorrido-venta.png')
    fireEvent.click(screen.getByRole('button', { name: /Sigue los abonos/ }))
    expect(
      screen.getByRole('heading', { name: 'Ten claro cuánto queda por cobrar.' }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: /Ampliar captura/ })).toHaveAttribute(
      'href',
      '/hero/recorrido-abonos.png',
    )
    fireEvent.click(screen.getByRole('button', { name: /Revisa tu stock/ }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/hero/recorrido-inventario.png')
    expect(screen.getByRole('button', { name: /Sigue los abonos/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})

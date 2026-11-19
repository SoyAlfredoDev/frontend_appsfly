import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import IntegrationKeys from './IntegrationKeys'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }))
vi.mock('../../api/axios.js', () => ({ default: api }))

it('distingue un error de carga de una lista vacía y permite reintentar', async () => {
  api.get
    .mockRejectedValueOnce(new Error('No disponible'))
    .mockResolvedValueOnce({ data: { keys: [] } })
  render(<IntegrationKeys />)
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las llaves')
  expect(screen.queryByText('Este negocio todavía no tiene llaves.')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Actualizar llaves' }))
  expect(await screen.findByText('Este negocio todavía no tiene llaves.')).toBeVisible()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Crear llave' })).toBeDisabled()
})

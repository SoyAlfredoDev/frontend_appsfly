import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import CustomerRutLookup from './CustomerRutLookup'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('../../api/axios.js', () => ({ default: { post } }))

it('permite reintentar una consulta fallida y no confunde el error con un cliente nuevo', async () => {
  const onNew = vi.fn()
  post.mockRejectedValueOnce(new Error('Sin conexión'))
  post.mockResolvedValueOnce({ data: { rut: '12345678-5', customers: [] } })
  render(<CustomerRutLookup onNew={onNew} />)
  await userEvent.type(screen.getByRole('textbox', { name: 'RUT del cliente' }), '12.345.678-5')
  await userEvent.click(screen.getByRole('button', { name: 'Buscar RUT' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo consultar el RUT')
  expect(onNew).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Buscar RUT' }))
  expect(onNew).toHaveBeenCalledWith('12345678-5', 'rut')
})

it('permite usar la ficha encontrada al volver del conflicto de guardado', async () => {
  const onSelect = vi.fn()
  const onNew = vi.fn()
  const customer = { customerId: 'existing', customerFirstName: 'Ana', customerLastName: 'QA' }
  render(
    <CustomerRutLookup
      initialMatch={{ rut: '12345678-5', customers: [customer] }}
      onNew={onNew}
      onSelect={onSelect}
    />,
  )
  expect(screen.getByRole('status')).toHaveTextContent('Este cliente ya está registrado')
  await userEvent.click(screen.getByRole('button', { name: 'Agregar a la venta' }))
  expect(onSelect).toHaveBeenCalledWith(customer)
  expect(onNew).not.toHaveBeenCalled()
})

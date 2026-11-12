import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import ClothingVariantsPage from './ClothingVariantsPage'

const mocks = vi.hoisted(() => ({
  categories: vi.fn(),
  save: vi.fn(),
  success: vi.fn(),
}))
vi.mock('../../api/category.js', () => ({ getCategories: mocks.categories }))
vi.mock('../../api/clothingVariants', () => ({ saveClothingModel: mocks.save }))
vi.mock('../../context/ToastContext.jsx', () => ({ useToast: () => ({ success: mocks.success }) }))

it('guarda el SKU y stock de cada talla y color por separado', async () => {
  mocks.categories.mockResolvedValue({
    data: [{ categoryId: 'ropa', categoryName: 'Ropa', allowedFor: 'PRODUCTS' }],
  })
  mocks.save.mockResolvedValue({ data: { createdCount: 2, skippedCount: 0 } })
  render(
    <MemoryRouter initialEntries={['/products_services/variants']}>
      <Routes>
        <Route path="/products_services/variants" element={<ClothingVariantsPage />} />
        <Route path="/products_services" element={<h1>Catálogo</h1>} />
      </Routes>
    </MemoryRouter>,
  )

  const fill = (name: string, value: string) =>
    fireEvent.change(screen.getByLabelText(name, { exact: true }), { target: { value } })

  await screen.findByRole('option', { name: 'Ropa' })
  fill('Nombre del modelo', 'Polera')
  fill('SKU del modelo', 'POL')
  fill('Precio unitario (CLP)', '12000')
  fireEvent.click(screen.getByRole('button', { name: 'Agregar variante' }))

  function variant(row: number, talla: string, sku: string, stock: string) {
    const group = within(screen.getByRole('group', { name: `Variante ${row}` }))
    for (const [label, value] of Object.entries({
      Talla: talla,
      Color: 'Negro',
      'SKU de la variante': sku,
      'Stock inicial': stock,
    })) {
      fireEvent.change(group.getByLabelText(label, { exact: true }), { target: { value } })
    }
  }
  variant(1, 'M', 'POL-M', '2')
  variant(2, 'L', 'POL-L', '3')
  fireEvent.click(screen.getByRole('button', { name: 'Guardar modelo' }))
  expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeVisible()
  expect(mocks.save).toHaveBeenCalledWith(
    { name: 'Polera', sku: 'POL', price: 12000, categoryId: 'ropa' },
    [
      { sku: 'POL-M', initialStock: 2, options: { talla: 'M', color: 'Negro' } },
      { sku: 'POL-L', initialStock: 3, options: { talla: 'L', color: 'Negro' } },
    ],
  )
})

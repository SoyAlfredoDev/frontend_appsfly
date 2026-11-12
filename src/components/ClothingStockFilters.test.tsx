import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { expect, it } from 'vitest'
import ClothingStockFilters, { filterClothingStock } from './ClothingStockFilters'

const stock = [
  { sku: 'POL-M-N', variantOptions: { talla: 'M', color: 'negro' } },
  { sku: 'POL-L-N', variantOptions: { talla: 'L', color: 'negro' } },
  { sku: 'POL-M-A', variantOptions: { Talla: 'm', Color: 'Azul' } },
]

function Catalog() {
  const [value, onChange] = useState({ size: '', color: '' })
  return (
    <>
      <ClothingStockFilters stock={stock} value={value} onChange={onChange} />
      <ul>
        {filterClothingStock(stock, value).map(({ sku }) => (
          <li key={sku}>{sku}</li>
        ))}
      </ul>
    </>
  )
}

it('combina los filtros de talla y color, incluidas variantes guardadas con otras mayúsculas', () => {
  render(<Catalog />)
  fireEvent.change(screen.getByLabelText('Talla'), { target: { value: 'M' } })
  expect(screen.queryByText('POL-L-N')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Color'), { target: { value: 'azul' } })
  expect(screen.getByText('POL-M-A')).toBeVisible()
  expect(screen.queryByText('POL-M-N')).not.toBeInTheDocument()
})

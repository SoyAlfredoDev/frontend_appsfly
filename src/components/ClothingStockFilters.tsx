import { clothingOptions } from '../utils/clothingOptions'

type Filters = { size: string; color: string }
type Stock = { variantOptions?: Record<string, unknown> }

export function filterClothingStock<T extends Stock>(stock: T[], filters: Filters) {
  return stock.filter(({ variantOptions }) => {
    const { size, color } = clothingOptions(variantOptions)
    return (!filters.size || size === filters.size) && (!filters.color || color === filters.color)
  })
}

export default function ClothingStockFilters({
  stock,
  value,
  onChange,
}: {
  stock: Stock[]
  value: Filters
  onChange: (value: Filters) => void
}) {
  const options = stock.map(({ variantOptions }) => clothingOptions(variantOptions))
  return (
    <>
      {(['size', 'color'] as const).map((key) => {
        const sizes = key === 'size'
        const choices = [...new Set([...options.map((item) => item[key]), value[key]])]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, 'es-CL', { numeric: true }))
        return (
          <label key={key} className="flex flex-col gap-1 text-xs font-medium text-slate-700">
            {sizes ? 'Talla' : 'Color'}
            <select
              value={value[key]}
              onChange={(event) => onChange({ ...value, [key]: event.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
            >
              <option value="">{sizes ? 'Todas las tallas' : 'Todos los colores'}</option>
              {choices.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </label>
        )
      })}
    </>
  )
}

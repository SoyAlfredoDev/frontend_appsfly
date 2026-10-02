export type ExpenseCategoryOption = {
  expenseCategoryId: string
  expenseCategoryName: string
}

type ExpenseCategoryFieldProps = {
  categories: ExpenseCategoryOption[]
  value: string
  onChange: (categoryId: string) => void
  status: 'loading' | 'ready' | 'error'
  errorMessage?: string | null
}

export default function ExpenseCategoryField({
  categories,
  value,
  onChange,
  status,
  errorMessage,
}: ExpenseCategoryFieldProps) {
  const disabled = status !== 'ready' || categories.length === 0

  return (
    <div className="relative">
      <label htmlFor="expenseCategoryId" className="sr-only">
        Categoría del gasto
      </label>
      <select
        id="expenseCategoryId"
        name="expenseCategoryId"
        aria-label="Categoría del gasto"
        className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-green-600 disabled:bg-slate-50 disabled:text-slate-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required
      >
        <option value="">
          {status === 'loading' ? 'Cargando categorías...' : 'Selecciona una categoría'}
        </option>
        {categories.map((category) => (
          <option key={category.expenseCategoryId} value={category.expenseCategoryId}>
            {category.expenseCategoryName}
          </option>
        ))}
      </select>
      <span className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 pointer-events-none select-none">
        Categoría
      </span>
      {status === 'loading' ? (
        <p role="status" className="mt-2 text-xs text-slate-500">
          Cargando categorías...
        </p>
      ) : null}
      {status === 'error' ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {errorMessage || 'No se pudieron cargar las categorías.'}
        </p>
      ) : null}
      {status === 'ready' && categories.length === 0 ? (
        <p role="status" className="mt-2 text-xs text-amber-700">
          No hay categorías disponibles.
        </p>
      ) : null}
    </div>
  )
}

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { getCategories } from '../../api/category.js'
import { saveClothingModel } from '../../api/clothingVariants'
import ExpensePageLayout from '../../components/ui/ExpensePageLayout.jsx'
import DataErrorPanel from '../../components/ui/DataErrorPanel'
import { useToast } from '../../context/ToastContext.jsx'

type Category = { categoryId: string; categoryName: string; allowedFor: string }
type VariantDraft = { id: number; size: string; color: string; sku: string; stock: string }
type Categories = { status: 'loading' | 'error' } | { status: 'ready'; rows: Category[] }

const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
const label = 'flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700'
const emptyVariant = (id: number): VariantDraft => ({
  id,
  size: '',
  color: '',
  sku: '',
  stock: '0',
})

export default function ClothingVariantsPage() {
  const nextRow = useRef(2)
  const [categories, setCategories] = useState<Categories>({ status: 'loading' })
  const [categoryId, setCategoryId] = useState('')
  const [reload, setReload] = useState(0)
  const [rows, setRows] = useState([emptyVariant(1)])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const abort = new AbortController()
    getCategories({ signal: abort.signal })
      .then(({ data }: { data: Category[] }) => {
        if (abort.signal.aborted) return
        const products = data.filter(({ allowedFor }) => allowedFor !== 'SERVICES')
        setCategories({ status: 'ready', rows: products })
        setCategoryId(
          products.find(({ categoryName }) => categoryName === 'Ropa')?.categoryId ??
            products[0]?.categoryId ??
            '',
        )
      })
      .catch(() => {
        if (!abort.signal.aborted) setCategories({ status: 'error' })
      })
    return () => abort.abort()
  }, [reload])

  function changeRow(id: number, key: keyof Omit<VariantDraft, 'id'>, value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)))
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const { data } = await saveClothingModel(
        {
          name: String(form.get('modelName') ?? '').trim(),
          sku: String(form.get('modelSku') ?? '').trim(),
          categoryId,
          price: Number(form.get('price')),
        },
        rows.map(({ sku, size, color, stock }) => ({
          sku: sku.trim(),
          options: { talla: size.trim(), color: color.trim() },
          initialStock: Number(stock),
        })),
      )
      toast.success(
        'Modelo guardado',
        `${data.createdCount} variantes nuevas.${data.skippedCount ? ` ${data.skippedCount} ya registradas.` : ''}`,
      )
      navigate('/products_services')
    } catch (cause) {
      const message = isAxiosError<{ message?: string }>(cause) ? cause.response?.data?.message : ''
      setError(message || 'No se pudo guardar el modelo. Intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ExpensePageLayout
      title="Modelo de ropa con variantes"
      actions={
        <Link to="/products_services" className="text-sm font-semibold text-primary">
          Volver al catálogo
        </Link>
      }
    >
      {categories.status === 'loading' && <p role="status">Cargando categorías…</p>}
      {categories.status === 'error' && (
        <DataErrorPanel
          message="No se pudieron cargar las categorías."
          onRetry={() => {
            setCategories({ status: 'loading' })
            setReload((value) => value + 1)
          }}
        />
      )}
      {categories.status === 'ready' && categories.rows.length === 0 && (
        <p className="rounded-xl border bg-white p-5">
          Crea una categoría de productos en el catálogo para registrar el modelo.
        </p>
      )}
      {categories.status === 'ready' && categories.rows.length > 0 && (
        <form onSubmit={save} className="space-y-5">
          <fieldset
            disabled={saving}
            className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
          >
            <label className={label}>
              Nombre del modelo
              <input className={field} name="modelName" required maxLength={120} />
            </label>
            <label className={label}>
              SKU del modelo
              <input className={field} name="modelSku" required maxLength={80} />
            </label>
            <label className={label}>
              Categoría
              <select
                className={field}
                value={categoryId}
                required
                onChange={(event) => setCategoryId(event.target.value)}
              >
                {categories.rows.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Precio unitario (CLP)
              <input
                className={field}
                name="price"
                type="number"
                min="0"
                max="2000000000"
                required
              />
            </label>
          </fieldset>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Variantes</h2>
            <p className="text-sm text-slate-600">
              Cada talla y color tiene un SKU y stock propios. Usa el mismo SKU de modelo para
              agregar variantes a un modelo existente.
            </p>
            {rows.map((row, index) => (
              <fieldset
                key={row.id}
                disabled={saving}
                className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 lg:grid-cols-[1fr_1fr_1.25fr_0.75fr_auto]"
              >
                <legend className="sr-only">Variante {index + 1}</legend>
                <label className={label}>
                  Talla
                  <input
                    className={field}
                    required
                    maxLength={40}
                    value={row.size}
                    onChange={(event) => changeRow(row.id, 'size', event.target.value)}
                  />
                </label>
                <label className={label}>
                  Color
                  <input
                    className={field}
                    required
                    maxLength={60}
                    value={row.color}
                    onChange={(event) => changeRow(row.id, 'color', event.target.value)}
                  />
                </label>
                <label className={label}>
                  SKU de la variante
                  <input
                    className={field}
                    required
                    maxLength={80}
                    value={row.sku}
                    onChange={(event) => changeRow(row.id, 'sku', event.target.value)}
                  />
                </label>
                <label className={label}>
                  Stock inicial
                  <input
                    className={field}
                    type="number"
                    min="0"
                    max="2000000000"
                    required
                    value={row.stock}
                    onChange={(event) => changeRow(row.id, 'stock', event.target.value)}
                  />
                </label>
                {rows.length > 1 && (
                  <button
                    className="justify-self-start self-end rounded-lg px-2 py-2 text-sm font-medium text-red-700"
                    type="button"
                    aria-label={`Quitar variante ${index + 1}`}
                    onClick={() => setRows((current) => current.filter(({ id }) => id !== row.id))}
                  >
                    Quitar
                  </button>
                )}
              </fieldset>
            ))}
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
              disabled={saving || rows.length === 1000}
              onClick={() => {
                const row = emptyVariant(nextRow.current++)
                setRows((current) => [...current, row])
              }}
            >
              Agregar variante
            </button>
          </section>
          {error && <DataErrorPanel message={error} />}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar modelo'}
          </button>
        </form>
      )}
    </ExpensePageLayout>
  )
}

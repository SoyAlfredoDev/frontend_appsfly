import { useState } from 'react'
import { FaPlus, FaTag, FaTrash, FaTimes } from 'react-icons/fa'
import { createExpenseCategory, deleteExpenseCategory } from '../../api/expense.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function ExpenseCategoriesModal({
  isOpen,
  onClose,
  categories,
  onCategoriesChanged,
}) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  if (!isOpen) return null

  const handleCreate = async (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    setSaving(true)
    try {
      await createExpenseCategory(trimmedName)
      setName('')
      await onCategoriesChanged()
      toast.success('Categoría creada', `Se agregó “${trimmedName}”.`)
    } catch (error) {
      toast.error(
        'No se pudo crear la categoría',
        error.response?.data?.error || 'Intenta nuevamente.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category) => {
    setDeletingId(category.expenseCategoryId)
    try {
      await deleteExpenseCategory(category.expenseCategoryId)
      await onCategoriesChanged()
      toast.success('Categoría eliminada', `Se quitó “${category.expenseCategoryName}”.`)
    } catch (error) {
      toast.error('No se pudo eliminar', error.response?.data?.error || 'Intenta nuevamente.')
      await onCategoriesChanged()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-categories-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id="expense-categories-title" className="text-lg font-bold text-slate-900">
              Categorías de gastos
            </h2>
            <p className="mt-1 text-sm text-slate-500">Organiza los gastos de este negocio.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleCreate} className="flex gap-2 border-b border-slate-100 px-6 py-4">
          <label className="sr-only" htmlFor="new-expense-category">
            Nueva categoría
          </label>
          <input
            id="new-expense-category"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            placeholder="Ej. Arriendo, servicios, insumos"
            className="input-field min-w-0 flex-1"
            required
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaPlus /> Agregar
          </button>
        </form>

        <ul className="max-h-[55vh] divide-y divide-slate-100 overflow-y-auto px-6">
          {categories.map((category) => {
            const expenseCount = category._count?.expenses ?? 0
            const protectedCategory = category.isSystem || expenseCount > 0
            return (
              <li
                key={category.expenseCategoryId}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <FaTag />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {category.expenseCategoryName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {category.isSystem
                        ? 'Categoría necesaria del sistema'
                        : `${expenseCount} gasto${expenseCount === 1 ? '' : 's'} asociado${expenseCount === 1 ? '' : 's'}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Eliminar ${category.expenseCategoryName}`}
                  title={
                    protectedCategory
                      ? 'No se puede eliminar una categoría protegida o con gastos'
                      : 'Eliminar categoría'
                  }
                  disabled={protectedCategory || deletingId === category.expenseCategoryId}
                  onClick={() => handleDelete(category)}
                  className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  <FaTrash />
                </button>
              </li>
            )
          })}
        </ul>
        <footer className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Listo
          </button>
        </footer>
      </section>
    </div>
  )
}

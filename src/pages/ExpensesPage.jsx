import { useEffect, useState, useCallback, useMemo } from "react";
import { getExpensesByMonth, deleteExpense } from "../api/expense.js";
import AddExpenseModal from "../components/modals/AddExpenseModal.jsx";
import ViewExpenseReceiptModal from "../components/modals/ViewExpenseReceiptModal.jsx";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FaTrash,
  FaEdit,
  FaEye,
  FaReceipt,
  FaMoneyBillWave,
  FaSearch,
  FaCalendarAlt,
  FaListUl,
} from "react-icons/fa";
import formatCurrency from "../utils/formatCurrency.js";
import formatDate from "../utils/formatDate.js";
import PageContainer, { PageHeader } from "../components/layout/PageContainer.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useConfirm } from "../context/ConfirmationContext.jsx";
import {
  generateMonthOptions,
  getCurrentMonthYear,
  toMonthYearKey,
  parseMonthYearKey,
  formatMonthYearLabel,
  getPaymentMethodLabel,
} from "../utils/monthOptions.js";

export default function ExpensesPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const monthOptions = useMemo(() => generateMonthOptions(24), []);
  const currentPeriod = getCurrentMonthYear();

  const [selectedPeriod, setSelectedPeriod] = useState(
    toMonthYearKey(currentPeriod.month, currentPeriod.year),
  );
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptExpense, setReceiptExpense] = useState(null);

  const { month, year } = parseMonthYearKey(selectedPeriod);
  const periodLabel = formatMonthYearLabel(month, year);
  const isCurrentMonth =
    month === currentPeriod.month && year === currentPeriod.year;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getExpensesByMonth(month, year);
      setExpenses(result.data.expenses ?? []);
      setTotalExpenses(result.data.total ?? 0);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Ocurrió un error al cargar los gastos.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExpenseAdded = () => {
    fetchData();
  };

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
    setSearchQuery("");
  };

  const handleViewReceipt = (expense) => {
    setReceiptExpense(expense);
  };

  const handleCloseReceipt = () => {
    setReceiptExpense(null);
  };

  const deletedExpense = async (expenseId) => {
    try {
      const isConfirmed = await confirm({
        title: 'Eliminar gasto',
        message: '¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.',
        variant: 'danger',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      });
      if (!isConfirmed) return;
      await deleteExpense(expenseId);
      toast.success('Gasto eliminado', 'El gasto se eliminó correctamente.');
      fetchData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error('Error', 'No se pudo eliminar el gasto.');
    }
  };

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return expenses;

    return expenses.filter((expense) => {
      const description = expense?.expenseDescription?.toLowerCase() ?? "";
      const userName = `${expense?.user?.userFirstName ?? ""} ${expense?.user?.userLastName ?? ""}`.toLowerCase();
      const payment = getPaymentMethodLabel(expense?.expensePaymentMethod).toLowerCase();
      return (
        description.includes(query) ||
        userName.includes(query) ||
        payment.includes(query)
      );
    });
  }, [expenses, searchQuery]);

  const filteredTotal = useMemo(
    () =>
      filteredExpenses.reduce(
        (sum, expense) => sum + (expense.expenseAmount || 0),
        0,
      ),
    [filteredExpenses],
  );

  const averageExpense =
    filteredExpenses.length > 0
      ? Math.round(filteredTotal / filteredExpenses.length)
      : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (error) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen ">
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative max-w-md"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
        <Motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <PageHeader
            title="Gestión de Gastos"
            subtitle="Registro y control de gastos operativos por periodo"
            actions={
              <>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10" />
                  <select
                    value={selectedPeriod}
                    onChange={handlePeriodChange}
                    className="select-field pl-10 pr-8 min-w-[200px]"
                    aria-label="Seleccionar mes"
                  >
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.value ===
                        toMonthYearKey(currentPeriod.month, currentPeriod.year)
                          ? " (actual)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <AddExpenseModal onExpenseAdded={handleExpenseAdded} />
              </>
            }
          />

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Motion.div
              variants={itemVariants}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
            >
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <FaMoneyBillWave className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Total {isCurrentMonth ? "del mes" : periodLabel}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </Motion.div>

            <Motion.div
              variants={itemVariants}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
            >
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <FaListUl className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Gastos registrados
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredExpenses.length}
                </p>
              </div>
            </Motion.div>

            <Motion.div
              variants={itemVariants}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
            >
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                <FaReceipt className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Promedio por gasto
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(averageExpense)}
                </p>
              </div>
            </Motion.div>
          </div>

          {/* Table */}
          <Motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Gastos de {periodLabel}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {loading
                    ? "Cargando..."
                    : `${filteredExpenses.length} registro${filteredExpenses.length !== 1 ? "s" : ""} encontrado${filteredExpenses.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por descripción, usuario..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Método de pago</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <tr key="loading">
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
                            <p className="text-gray-500 text-sm">
                              Cargando gastos de {periodLabel}...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredExpenses.length === 0 ? (
                      <tr key="empty">
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                            <FaMoneyBillWave className="text-4xl text-gray-300" />
                            <p className="text-sm font-medium">
                              {searchQuery
                                ? "No se encontraron gastos con ese criterio."
                                : `No hay gastos registrados en ${periodLabel}.`}
                            </p>
                            {!searchQuery && isCurrentMonth && (
                              <p className="text-xs text-gray-400">
                                Usa el botón &quot;Agregar Gasto&quot; para registrar el primero.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <Motion.tr
                          key={expense?.expenseId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                            {formatDate(expense?.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-gray-800 font-medium text-sm max-w-xs">
                            <span className="line-clamp-2">
                              {expense?.expenseDescription || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {getPaymentMethodLabel(expense?.expensePaymentMethod)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-primary font-semibold text-sm whitespace-nowrap">
                            {formatCurrency(expense?.expenseAmount)}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                            {expense?.user?.userFirstName}{" "}
                            {expense?.user?.userLastName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              {expense?.expenseImageUrl ? (
                                <button
                                  type="button"
                                  onClick={() => handleViewReceipt(expense)}
                                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Ver comprobante"
                                >
                                  <FaEye />
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="p-2 text-gray-300 cursor-not-allowed"
                                  title="Sin comprobante"
                                >
                                  <FaEye />
                                </button>
                              )}

                              <button
                                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <FaEdit />
                              </button>

                              <button
                                onClick={() => deletedExpense(expense?.expenseId)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </Motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Motion.div>
        </Motion.div>

      <ViewExpenseReceiptModal
        key={receiptExpense?.expenseId}
        isOpen={Boolean(receiptExpense)}
        onClose={handleCloseReceipt}
        expense={receiptExpense}
      />
    </PageContainer>
  );
}

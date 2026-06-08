import { useCallback, useEffect, useState } from "react";
import { FaPlus, FaExchangeAlt, FaEye, FaArrowDown, FaArrowUp } from "react-icons/fa";
import AddTransactionModal from "../components/modals/AddTransactionModal.jsx";
import ViewTransactionModal from "../components/transactions/ViewTransactionModal.jsx";
import ExpensePageLayout from "../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableEmpty,
  ExpenseTableLoading,
} from "../components/ui/ExpenseTableCard.jsx";
import { getTransactions, getTransactionsSummary } from "../api/transaction.js";
import formatDate from "../utils/formatDate.js";
import {
  parseTransactionAmount,
  formatPaymentMethod,
  formatTransactionType,
  formatSignedAmount,
} from "../utils/transactionUtils.js";
import {
  KPI_CARD,
  KPI_ICON_PRIMARY,
  KPI_ICON_SECONDARY,
  KPI_ICON_AMBER,
  KPI_LABEL,
  KPI_VALUE,
  THEAD,
  TH,
  TD_MUTED,
  TBODY,
  TR_ROW,
  PRIMARY_BTN,
  ACTION_VIEW,
} from "../utils/expenseUiPatterns.js";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewTransaction, setViewTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, summaryRes] = await Promise.all([
        getTransactions(),
        getTransactionsSummary(),
      ]);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      setSummary(summaryRes.data ?? null);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = transactions.filter((t) => {
    if (!globalFilter.trim()) return true;
    const q = globalFilter.toLowerCase();
    const { direction } = parseTransactionAmount(t);
    return (
      t.transactionDescription?.toLowerCase().includes(q) ||
      t.transactionType?.toLowerCase().includes(q) ||
      formatTransactionType(t.transactionType).toLowerCase().includes(q) ||
      formatPaymentMethod(t.transactionMethod).toLowerCase().includes(q) ||
      direction.toLowerCase().includes(q)
    );
  });

  const formatMoney = (n) =>
    Number(n ?? 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  return (
    <ExpensePageLayout
      title="Transacciones"
      subtitle="Registro de entradas y salidas de dinero del negocio"
      actions={
        <>
          <button type="button" onClick={() => setIsModalOpen(true)} className={PRIMARY_BTN}>
            <FaPlus /> Agregar transacción
          </button>
          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreated={() => {
              setIsModalOpen(false);
              fetchData();
            }}
          />
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={KPI_CARD}>
          <div className={KPI_ICON_PRIMARY}>
            <FaExchangeAlt className="text-xl" />
          </div>
          <div>
            <p className={KPI_LABEL}>Efectivo disponible</p>
            <p className={KPI_VALUE}>{formatMoney(summary?.cashAvailable)}</p>
          </div>
        </div>
        <div className={KPI_CARD}>
          <div className={KPI_ICON_SECONDARY}>
            <FaArrowDown className="text-xl" />
          </div>
          <div>
            <p className={KPI_LABEL}>Total entradas</p>
            <p className={`${KPI_VALUE} text-emerald-600`}>{formatMoney(summary?.totalIn)}</p>
          </div>
        </div>
        <div className={KPI_CARD}>
          <div className={KPI_ICON_AMBER}>
            <FaArrowUp className="text-xl" />
          </div>
          <div>
            <p className={KPI_LABEL}>Total salidas</p>
            <p className={`${KPI_VALUE} text-red-600`}>{formatMoney(summary?.totalOut)}</p>
          </div>
        </div>
        <div className={KPI_CARD}>
          <div className={KPI_ICON_PRIMARY}>
            <FaExchangeAlt className="text-xl" />
          </div>
          <div>
            <p className={KPI_LABEL}>Balance neto</p>
            <p className={KPI_VALUE}>{formatMoney(summary?.netBalance)}</p>
          </div>
        </div>
      </div>

      <ExpenseTableCard
        sectionTitle="Movimientos registrados"
        recordCount={filtered.length}
        loading={loading}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Buscar por descripción, tipo, método..."
      >
        <ExpenseTableScroll>
          <table className="w-full text-left border-collapse">
            <thead className={THEAD}>
              <tr>
                <th className={TH}>Fecha</th>
                <th className={TH}>Movimiento</th>
                <th className={TH}>Tipo</th>
                <th className={TH}>Método</th>
                <th className={TH}>Descripción</th>
                <th className={TH}>Monto</th>
                <th className={`${TH} text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={TBODY}>
              {loading ? (
                <ExpenseTableLoading colSpan={7} message="Cargando transacciones..." />
              ) : filtered.length === 0 ? (
                <ExpenseTableEmpty
                  colSpan={7}
                  icon={<FaExchangeAlt className="text-4xl text-gray-300" />}
                  title="No se encontraron transacciones."
                  hint="Los pagos, gastos y compras se registran automáticamente."
                />
              ) : (
                filtered.map((transaction) => {
                  const { direction } = parseTransactionAmount(transaction);
                  const isOut = direction === "OUT";
                  return (
                    <tr key={transaction.transactionId} className={TR_ROW}>
                      <td className={TD_MUTED}>
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className={TD_MUTED}>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isOut
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isOut ? "Salida" : "Entrada"}
                        </span>
                      </td>
                      <td className={TD_MUTED}>
                        {formatTransactionType(transaction.transactionType)}
                      </td>
                      <td className={TD_MUTED}>
                        {formatPaymentMethod(transaction.transactionMethod)}
                      </td>
                      <td className={TD_MUTED}>
                        {transaction.transactionDescription || "—"}
                      </td>
                      <td
                        className={`px-6 py-4 font-semibold text-sm whitespace-nowrap ${
                          isOut ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {formatSignedAmount(transaction)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          className={ACTION_VIEW}
                          title="Ver detalle"
                          onClick={() => setViewTransaction(transaction)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ExpenseTableScroll>
      </ExpenseTableCard>

      <ViewTransactionModal
        transaction={viewTransaction}
        isOpen={Boolean(viewTransaction)}
        onClose={() => setViewTransaction(null)}
      />
    </ExpensePageLayout>
  );
}

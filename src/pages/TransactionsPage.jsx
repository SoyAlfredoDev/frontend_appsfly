import { useCallback, useEffect, useState } from "react";
import { FaPlus, FaExchangeAlt, FaEye, FaArrowDown, FaArrowUp, FaMoneyBillWave } from "react-icons/fa";
import AddTransactionModal from "../components/modals/AddTransactionModal.jsx";
import ViewTransactionModal from "../components/transactions/ViewTransactionModal.jsx";
import TransactionKpiDetailModal from "../components/transactions/TransactionKpiDetailModal.jsx";
import ClickableKpiCard, {
  KPI_ICON_PRIMARY,
  KPI_ICON_SECONDARY,
  KPI_ICON_AMBER,
  KPI_LABEL,
  KPI_VALUE,
} from "../components/transactions/ClickableKpiCard.jsx";
import ExpensePageLayout from "../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableEmpty,
  ExpenseTableLoading,
} from "../components/ui/ExpenseTableCard.jsx";
import { getTransactions, getTransactionsSummary } from "../api/transaction.js";
import { transactionSourcePath } from "../utils/cashBook.ts";
import { Link } from "react-router-dom";
import { unwrapListPayload } from "../utils/listPayload.js";
import useDebouncedValue from "../hooks/useDebouncedValue.js";
import formatDate from "../utils/formatDate.js";
import {
  parseTransactionAmount,
  formatPaymentMethod,
  formatTransactionType,
  formatSignedAmount,
  PAYMENT_METHODS,
  TRANSACTION_TYPE_LABELS,
} from "../utils/transactionUtils.js";
import {
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
  const [methodFilter, setMethodFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewTransaction, setViewTransaction] = useState(null);
  const [kpiDetailView, setKpiDetailView] = useState(null);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebouncedValue(globalFilter, 300);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [txRes, summaryRes] = await Promise.all([
        getTransactions({
          page: 1,
          limit: 100,
          q: debouncedQuery.trim() || undefined,
          method: methodFilter || undefined,
          type: typeFilter || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        }),
        getTransactionsSummary(),
      ]);
      const { rows } = unwrapListPayload(txRes.data);
      setTransactions(rows);
      setSummary(summaryRes.data ?? null);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
      setSummary(null);
      setLoadError("No se pudieron cargar los movimientos.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, methodFilter, typeFilter, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = transactions;

  const formatMoney = (n) =>
    Number(n ?? 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  return (
    <ExpensePageLayout
      title="Movimientos"
      subtitle="Libro de caja: cobros, gastos, compras y retiros"
      actions={
        <>
          <button type="button" onClick={() => setIsModalOpen(true)} className={PRIMARY_BTN}>
            <FaPlus /> Registrar movimiento
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ClickableKpiCard onClick={() => setKpiDetailView("cash")}>
          <div className={KPI_ICON_PRIMARY}>
            <FaMoneyBillWave className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={KPI_LABEL}>Efectivo disponible</p>
            <p className={KPI_VALUE}>{formatMoney(summary?.cashAvailable)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Ver detalle · Saldo del libro en efectivo</p>
          </div>
        </ClickableKpiCard>
        <ClickableKpiCard onClick={() => setKpiDetailView("inMonth")}>
          <div className={KPI_ICON_SECONDARY}>
            <FaArrowDown className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={KPI_LABEL}>Total entradas mes</p>
            <p className={`${KPI_VALUE} text-emerald-600`}>{formatMoney(summary?.totalInMonth)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Ver detalle · Origen de cada entrada</p>
          </div>
        </ClickableKpiCard>
        <ClickableKpiCard onClick={() => setKpiDetailView("outMonth")}>
          <div className={KPI_ICON_AMBER}>
            <FaArrowUp className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={KPI_LABEL}>Total salidas mes</p>
            <p className={`${KPI_VALUE} text-red-600`}>{formatMoney(summary?.totalOutMonth)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Ver detalle · Origen de cada salida</p>
          </div>
        </ClickableKpiCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="text-xs text-gray-500">
          Desde
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="mt-1 w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"
          />
        </label>
        <label className="text-xs text-gray-500">
          Hasta
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="mt-1 w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"
          />
        </label>
        <label className="text-xs text-gray-500">
          Medio
          <select
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
            className="mt-1 w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">Todos</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-gray-500">
          Tipo
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="mt-1 w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">Todos</option>
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={fetchData} className="font-semibold underline">
            Reintentar
          </button>
        </div>
      )}

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
              ) : loadError ? (
                <ExpenseTableEmpty
                  colSpan={7}
                  icon={<FaExchangeAlt className="text-4xl text-gray-300" />}
                  title="No se pudo cargar el libro."
                  hint="Reintenta la carga. Los movimientos ya registrados siguen en el servidor."
                />
              ) : filtered.length === 0 ? (
                <ExpenseTableEmpty
                  colSpan={7}
                  icon={<FaExchangeAlt className="text-4xl text-gray-300" />}
                  title="No hay movimientos en este filtro."
                  hint="Los cobros, gastos y compras de contado se anotan solos. El fondo, el retiro y otros ingresos se cargan a mano."
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
                        <div>{transaction.transactionDescription || "—"}</div>
                        {transactionSourcePath(transaction) && (
                          <Link
                            to={transactionSourcePath(transaction)}
                            className="text-xs text-primary hover:underline"
                          >
                            Ver origen
                          </Link>
                        )}
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

      <TransactionKpiDetailModal
        isOpen={Boolean(kpiDetailView)}
        onClose={() => setKpiDetailView(null)}
        view={kpiDetailView}
        transactions={transactions}
        onViewTransaction={(transaction) => {
          setKpiDetailView(null);
          setViewTransaction(transaction);
        }}
      />
    </ExpensePageLayout>
  );
}

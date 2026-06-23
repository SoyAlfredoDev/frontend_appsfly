import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaExchangeAlt, FaEye } from "react-icons/fa";
import { getCashAvailableDetail } from "../../api/transaction.js";
import formatDate from "../../utils/formatDate.js";
import { formatMonthYearLabel } from "../../utils/monthOptions.js";
import {
    parseTransactionAmount,
    formatPaymentMethod,
    formatTransactionType,
    formatSignedAmount,
} from "../../utils/transactionUtils.js";
import {
    TRANSACTION_KPI_VIEWS,
    filterTransactionsForKpiView,
} from "../../utils/transactionKpiFilters.js";
import ExpenseTableCard, {
    ExpenseTableScroll,
    ExpenseTableLoading,
    ExpenseTableEmpty,
} from "../ui/ExpenseTableCard.jsx";
import {
    THEAD,
    TH,
    TBODY,
    TR_ROW,
    TD_MUTED,
    ACTION_VIEW,
} from "../../utils/expenseUiPatterns.js";

function formatMoney(value) {
    return Number(value ?? 0).toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
    });
}

function LedgerMovementsTable({ rows, loading, onViewTransaction, emptyTitle }) {
    return (
        <ExpenseTableCard
            sectionTitle="Movimientos del periodo"
            recordCount={rows.length}
            loading={loading}
            showSearch={false}
            disableAnimation
            className="shadow-sm"
        >
            <ExpenseTableScroll>
                <table className="w-full text-left border-collapse">
                    <thead className={THEAD}>
                        <tr>
                            <th className={TH}>Fecha</th>
                            <th className={TH}>Origen</th>
                            <th className={TH}>Tipo</th>
                            <th className={TH}>Método</th>
                            <th className={TH}>Descripción</th>
                            <th className={TH}>Monto</th>
                            <th className={`${TH} text-center`}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className={TBODY}>
                        {loading ? (
                            <ExpenseTableLoading colSpan={7} message="Cargando movimientos..." />
                        ) : rows.length === 0 ? (
                            <ExpenseTableEmpty
                                colSpan={7}
                                icon={<FaExchangeAlt className="text-4xl text-gray-300" />}
                                title={emptyTitle}
                            />
                        ) : (
                            rows.map((transaction) => {
                                const { direction } = parseTransactionAmount(transaction);
                                const isOut = direction === "OUT";
                                return (
                                    <tr key={transaction.transactionId} className={TR_ROW}>
                                        <td className={TD_MUTED}>{formatDate(transaction.createdAt)}</td>
                                        <td className={TD_MUTED}>
                                            {formatTransactionType(transaction.transactionType)}
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
                                                onClick={() => onViewTransaction?.(transaction)}
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
    );
}

function CashOriginTable({ title, rows, amountClass, linkBuilder }) {
    return (
        <ExpenseTableCard
            sectionTitle={title}
            recordCount={rows.length}
            loading={false}
            showSearch={false}
            disableAnimation
            className="shadow-sm"
        >
            <ExpenseTableScroll>
                <table className="w-full text-left border-collapse">
                    <thead className={THEAD}>
                        <tr>
                            <th className={TH}>Fecha</th>
                            <th className={TH}>Origen</th>
                            <th className={TH}>Descripción</th>
                            <th className={TH}>Monto</th>
                            {linkBuilder && <th className={`${TH} text-center`}>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className={TBODY}>
                        {rows.length === 0 ? (
                            <ExpenseTableEmpty
                                colSpan={linkBuilder ? 5 : 4}
                                title="No hay registros en esta categoría."
                            />
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id} className={TR_ROW}>
                                    <td className={TD_MUTED}>{formatDate(row.date)}</td>
                                    <td className={TD_MUTED}>{row.origin}</td>
                                    <td className={TD_MUTED}>{row.description}</td>
                                    <td className={`px-6 py-4 font-semibold text-sm whitespace-nowrap ${amountClass}`}>
                                        {formatMoney(row.amount)}
                                    </td>
                                    {linkBuilder && (
                                        <td className="px-6 py-4 text-center">
                                            {linkBuilder(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ExpenseTableScroll>
        </ExpenseTableCard>
    );
}

export default function TransactionKpiDetailModal({
    isOpen,
    onClose,
    view,
    transactions = [],
    onViewTransaction,
}) {
    const [cashDetail, setCashDetail] = useState(null);
    const [loadingCash, setLoadingCash] = useState(false);

    const meta = TRANSACTION_KPI_VIEWS[view] ?? TRANSACTION_KPI_VIEWS.cash;
    const monthLabel = formatMonthYearLabel(
        new Date().getMonth() + 1,
        new Date().getFullYear(),
    );

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || view !== "cash") return;

        let cancelled = false;

        const loadCashDetail = async () => {
            setLoadingCash(true);
            try {
                const response = await getCashAvailableDetail();
                if (!cancelled) setCashDetail(response.data ?? null);
            } catch (error) {
                console.error("Error loading cash detail:", error);
                if (!cancelled) setCashDetail(null);
            } finally {
                if (!cancelled) setLoadingCash(false);
            }
        };

        loadCashDetail();

        return () => {
            cancelled = true;
        };
    }, [isOpen, view]);

    const ledgerRows = useMemo(
        () => filterTransactionsForKpiView(transactions, view),
        [transactions, view],
    );

    const subtitle =
        view === "cash"
            ? meta.subtitle
            : `${meta.subtitle} (${monthLabel})`;

    return (
        <AnimatePresence>
            {isOpen && view && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="transaction-kpi-modal-title"
                >
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    <Motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 16 }}
                        onClick={(event) => event.stopPropagation()}
                        className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/80 shrink-0">
                            <div>
                                <h3 id="transaction-kpi-modal-title" className="text-lg font-bold text-gray-800">
                                    {meta.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/80 rounded-lg transition-colors shrink-0"
                                aria-label="Cerrar"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50 space-y-4 min-h-0">
                            {view === "cash" ? (
                                loadingCash ? (
                                    <div className="flex justify-center py-16">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
                                                <p className="text-[10px] uppercase font-semibold text-emerald-700">
                                                    Entradas en efectivo
                                                </p>
                                                <p className="text-lg font-bold text-emerald-700 mt-1">
                                                    {formatMoney(cashDetail?.cashPaymentsTotal)}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-red-100 bg-red-50/80 p-4">
                                                <p className="text-[10px] uppercase font-semibold text-red-700">
                                                    Salidas en efectivo
                                                </p>
                                                <p className="text-lg font-bold text-red-700 mt-1">
                                                    {formatMoney(cashDetail?.cashExpensesTotal)}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                                <p className="text-[10px] uppercase font-semibold text-primary">
                                                    Efectivo disponible
                                                </p>
                                                <p className="text-lg font-bold text-primary mt-1">
                                                    {formatMoney(cashDetail?.cashAvailable)}
                                                </p>
                                            </div>
                                        </div>

                                        <CashOriginTable
                                            title="Pagos en efectivo (ventas)"
                                            rows={cashDetail?.payments ?? []}
                                            amountClass="text-emerald-600"
                                            linkBuilder={(row) =>
                                                row.saleId ? (
                                                    <Link
                                                        to={`/sales/view/${row.saleId}`}
                                                        className={ACTION_VIEW}
                                                        title="Ver venta"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                ) : null
                                            }
                                        />

                                        <CashOriginTable
                                            title="Gastos en efectivo"
                                            rows={cashDetail?.expenses ?? []}
                                            amountClass="text-red-600"
                                        />
                                    </>
                                )
                            ) : (
                                <LedgerMovementsTable
                                    rows={ledgerRows}
                                    loading={false}
                                    onViewTransaction={onViewTransaction}
                                    emptyTitle={
                                        view === "inMonth"
                                            ? "No hay entradas registradas este mes."
                                            : "No hay salidas registradas este mes."
                                    }
                                />
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

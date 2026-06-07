import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaMoneyBillWave,
    FaListUl,
    FaGift,
    FaBuilding,
} from "react-icons/fa";
import { getAdminSubscriptionPayments } from "../../api/mercadopago/index.js";
import {
    MP_PAYMENT_METHOD_LABELS,
    MP_PAYMENT_STATUS_LABELS,
} from "../../api/mercadopago/constants.js";
import formatCurrency from "../../utils/formatCurrency.js";
import formatDate from "../../utils/formatDate.js";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import KpiComponent from "../../components/KpiComponent.jsx";
import {
    generateMonthOptions,
    getCurrentMonthYear,
    toMonthYearKey,
    parseMonthYearKey,
    formatMonthYearLabel,
} from "../../utils/monthOptions.js";

function PaymentStatusBadge({ status }) {
    const styles = {
        APPROVED: "bg-primary/10 text-primary border-primary/20",
        PENDING: "bg-amber-500/15 text-amber-700 border-amber-200",
        REJECTED: "bg-red-500/10 text-red-600 border-red-200",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
        >
            {MP_PAYMENT_STATUS_LABELS[status] ?? status}
        </span>
    );
}

function shortTransactionId(id) {
    if (!id) return "—";
    return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

export default function PaymentsAdminPage() {
    const monthOptions = useMemo(() => generateMonthOptions(24), []);
    const currentPeriod = getCurrentMonthYear();
    const [selectedPeriod, setSelectedPeriod] = useState(
        toMonthYearKey(currentPeriod.month, currentPeriod.year),
    );
    const [payments, setPayments] = useState([]);
    const [metrics, setMetrics] = useState({
        monthlyMercadoPagoRevenue: 0,
        processedCount: 0,
        activeFreeTrials: 0,
        totalRecords: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { month, year } = parseMonthYearKey(selectedPeriod);
    const periodLabel = formatMonthYearLabel(month, year);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminSubscriptionPayments();
            setPayments(Array.isArray(res.data?.payments) ? res.data.payments : []);
            setMetrics(res.data?.metrics ?? {
                monthlyMercadoPagoRevenue: 0,
                processedCount: 0,
                activeFreeTrials: 0,
                totalRecords: 0,
            });
        } catch (err) {
            console.error("[PaymentsAdmin]", err);
            setError("No se pudo cargar el historial global de pagos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const periodPayments = useMemo(
        () =>
            payments.filter((payment) => {
                const date = new Date(payment.createdAt);
                return date.getMonth() + 1 === month && date.getFullYear() === year;
            }),
        [payments, month, year],
    );

    const filteredPayments = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return periodPayments;

        return periodPayments.filter((payment) => {
            const haystack = [
                payment.subscriptionPaymentId,
                payment.business?.businessName,
                payment.plan?.planName,
                MP_PAYMENT_METHOD_LABELS[payment.paymentMethod],
                MP_PAYMENT_STATUS_LABELS[payment.status],
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [periodPayments, searchQuery]);

    const periodMetrics = useMemo(() => {
        const monthlyMercadoPagoRevenue = periodPayments
            .filter((p) => p.paymentMethod === "MERCADO_PAGO" && p.status === "APPROVED")
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const processedCount = periodPayments.filter((p) => p.status === "APPROVED").length;
        const activeFreeTrials = periodPayments.filter(
            (p) => p.paymentMethod === "PROMO_FREE_TRIAL" && p.status === "APPROVED",
        ).length;

        return { monthlyMercadoPagoRevenue, processedCount, activeFreeTrials };
    }, [periodPayments]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <PageContainer className="!bg-transparent">
            <Motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Motion.div variants={itemVariants}>
                    <PageHeader
                        title="Historial de Pagos Global"
                        subtitle="Transacciones SaaS consolidadas — auditoría de ingresos, promociones y Mercado Pago"
                        actions={
                            <select
                                value={selectedPeriod}
                                onChange={(e) => {
                                    setSelectedPeriod(e.target.value);
                                    setSearchQuery("");
                                }}
                                className="select-field min-w-[200px]"
                                aria-label="Seleccionar mes"
                            >
                                {monthOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        }
                    />
                </Motion.div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <Motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <KpiComponent
                        title="Ingresos consolidados del mes"
                        icon={<FaMoneyBillWave />}
                        value={loading ? null : periodMetrics.monthlyMercadoPagoRevenue}
                        footer={`Mercado Pago — ${periodLabel}`}
                        loading={loading}
                        isCurrency
                    />
                    <KpiComponent
                        title="Transacciones procesadas"
                        icon={<FaListUl />}
                        value={loading ? null : periodMetrics.processedCount}
                        footer="Pagos aprobados en el periodo"
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        title="Planes de prueba activos"
                        icon={<FaGift />}
                        value={loading ? null : periodMetrics.activeFreeTrials}
                        footer="Promos P001 registradas"
                        loading={loading}
                        isCurrency={false}
                    />
                </Motion.div>

                <Motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800">
                                Transacciones de {periodLabel}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {loading
                                    ? "Cargando..."
                                    : `${filteredPayments.length} registro${filteredPayments.length !== 1 ? "s" : ""} encontrado${filteredPayments.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por ID, empresa o plan..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">ID Pago</th>
                                    <th className="px-6 py-4">Empresa</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Método de pago</th>
                                    <th className="px-6 py-4">Monto</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <tr key="loading">
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
                                                    <p className="text-gray-500 text-sm">
                                                        Cargando transacciones de {periodLabel}...
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredPayments.length === 0 ? (
                                        <tr key="empty">
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                                                    <FaMoneyBillWave className="text-4xl text-gray-300" />
                                                    <p className="text-sm font-medium">
                                                        {searchQuery
                                                            ? "No se encontraron transacciones con ese criterio."
                                                            : `No hay transacciones registradas en ${periodLabel}.`}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment) => (
                                            <Motion.tr
                                                key={payment.subscriptionPaymentId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-gray-50/80 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm font-mono text-gray-700">
                                                    {shortTransactionId(payment.subscriptionPaymentId)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary shrink-0">
                                                            <FaBuilding className="text-xs" />
                                                        </span>
                                                        <div>
                                                            <Link
                                                                to={`/admin/businesses/${payment.business?.businessId}`}
                                                                className="text-sm font-semibold text-dark no-underline hover:text-secondary"
                                                            >
                                                                {payment.business?.businessName ?? "—"}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {payment.plan?.planName ?? payment.subscriptionPlanId}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {MP_PAYMENT_METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {formatCurrency(payment.amount, "es-CL", payment.currency || "CLP")}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(payment.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <PaymentStatusBadge status={payment.status} />
                                                </td>
                                            </Motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </Motion.div>

                {!loading && metrics.totalRecords > 0 && (
                    <p className="text-xs text-slate-400 text-center">
                        Histórico total en plataforma: {metrics.totalRecords} transacciones registradas.
                    </p>
                )}
            </Motion.div>
        </PageContainer>
    );
}

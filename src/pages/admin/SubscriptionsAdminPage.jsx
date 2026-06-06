import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaBuilding,
    FaCheckCircle,
    FaExclamationTriangle,
    FaMoneyBillWave,
    FaEye,
    FaCreditCard,
} from "react-icons/fa";
import { getAdminSubscriptions } from "../../api/admin.js";
import { getPlansRequest } from "../../api/plans.js";
import formatDate from "../../utils/formatDate.js";
import formatCurrency from "../../utils/formatCurrency.js";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import KpiComponent from "../../components/KpiComponent.jsx";
import SelectFloatingComponent from "../../components/inputs/SelectFloatingComponent.jsx";
import {
    TABLE_WRAPPER,
    TABLE_TOOLBAR,
    THEAD,
    TH,
    TBODY,
    TD,
    TD_AMOUNT,
    TR_ROW,
    ACTION_VIEW,
    formatRecordCount,
} from "../../utils/expenseUiPatterns.js";

const EXPIRING_WINDOW_DAYS = 7;

const TAB_OPTIONS = [
    { id: "ACTIVE", label: "Activas" },
    { id: "EXPIRING", label: "Próximas a vencer" },
];

function daysUntil(dateValue) {
    if (!dateValue) return null;
    const end = new Date(dateValue);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function isSubscriptionActive(sub) {
    if (sub?.subscriptionStatus !== "ACTIVE") return false;
    const end = new Date(sub.subscriptionEndDate);
    return end > new Date();
}

function isExpiringSoon(sub) {
    if (!isSubscriptionActive(sub)) return false;
    const days = daysUntil(sub.subscriptionEndDate);
    return days !== null && days >= 0 && days <= EXPIRING_WINDOW_DAYS;
}

function monthlyEquivalent(sub) {
    const amount = Number(sub?.subscriptionAmount ?? 0);
    const duration = Number(sub?.subscriptionDuration) || 1;
    return amount / duration;
}

function SubscriptionStatusBadge({ sub }) {
    if (isExpiringSoon(sub)) {
        return (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Próxima a vencer
            </span>
        );
    }
    if (isSubscriptionActive(sub)) {
        return (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                Activa
            </span>
        );
    }

    const styles = {
        INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
        CANCELLED: "bg-red-500/10 text-red-600 border-red-200",
        EXPIRED: "bg-slate-100 text-slate-500 border-slate-200",
        PENDIENT: "bg-secondary/10 text-secondary border-blue-200",
    };
    const labels = {
        INACTIVE: "Inactiva",
        CANCELLED: "Cancelada",
        EXPIRED: "Expirada",
        PENDIENT: "Pendiente",
    };
    const status = sub?.subscriptionStatus ?? "INACTIVE";

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] ?? styles.INACTIVE}`}
        >
            {labels[status] ?? status}
        </span>
    );
}

export default function SubscriptionsAdminPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("ACTIVE");
    const [searchQuery, setSearchQuery] = useState("");
    const [planFilter, setPlanFilter] = useState("ALL");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [subsRes, plansRes] = await Promise.all([
                getAdminSubscriptions(),
                getPlansRequest(),
            ]);
            setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : []);
            setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
        } catch (err) {
            console.error("[SubscriptionsAdmin]", err);
            setError("No se pudieron cargar las suscripciones globales.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const metrics = useMemo(() => {
        const activeCount = subscriptions.filter(isSubscriptionActive).length;
        const expiringCount = subscriptions.filter(isExpiringSoon).length;
        const projectedMrr = subscriptions
            .filter(isSubscriptionActive)
            .reduce((sum, sub) => sum + monthlyEquivalent(sub), 0);

        return { activeCount, expiringCount, projectedMrr };
    }, [subscriptions]);

    const planOptions = useMemo(() => {
        const fromApi = plans.map((plan) => ({
            value: plan.planId,
            label: plan.planName ?? plan.planId,
        }));
        const fromSubs = subscriptions.reduce((acc, sub) => {
            const id = sub.subscriptionPlanId;
            if (!id || acc.some((item) => item.value === id)) return acc;
            acc.push({
                value: id,
                label: sub.plan?.planName ?? id,
            });
            return acc;
        }, []);
        const merged = [...fromApi];
        fromSubs.forEach((item) => {
            if (!merged.some((m) => m.value === item.value)) merged.push(item);
        });
        return [{ value: "ALL", label: "Todos los planes" }, ...merged];
    }, [plans, subscriptions]);

    const filteredSubscriptions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return subscriptions.filter((sub) => {
            const matchesTab =
                activeTab === "EXPIRING"
                    ? isExpiringSoon(sub)
                    : isSubscriptionActive(sub) && !isExpiringSoon(sub);

            if (!matchesTab) return false;

            if (planFilter !== "ALL" && sub.subscriptionPlanId !== planFilter) {
                return false;
            }

            if (!query) return true;

            const haystack = [
                sub.business?.businessName,
                sub.plan?.planName,
                sub.subscriptionPlanId,
                sub.subscriptionId,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [subscriptions, activeTab, searchQuery, planFilter]);

    return (
        <PageContainer className="!bg-transparent">
            <div className="space-y-6">
                <PageHeader
                    title="Control de suscripciones"
                    subtitle="Membresías globales de la plataforma — monitoreo de ingresos y alertas de renovación"
                />

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <KpiComponent
                        title="Suscripciones activas"
                        icon={<FaCheckCircle />}
                        value={loading ? null : metrics.activeCount}
                        footer="Tenants operando con plan vigente"
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        title="Próximas a vencer"
                        icon={<FaExclamationTriangle />}
                        value={loading ? null : metrics.expiringCount}
                        footer={`Renovación en ≤ ${EXPIRING_WINDOW_DAYS} días`}
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        title="Facturación mensual proyectada"
                        icon={<FaMoneyBillWave />}
                        value={loading ? null : Math.round(metrics.projectedMrr)}
                        footer="MRR estimado de planes activos"
                        loading={loading}
                        isCurrency
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {TAB_OPTIONS.map((tab) => {
                        const isSelected = activeTab === tab.id;
                        const count =
                            tab.id === "EXPIRING"
                                ? metrics.expiringCount
                                : subscriptions.filter(
                                      (s) => isSubscriptionActive(s) && !isExpiringSoon(s),
                                  ).length;

                        return (
                            <motion.button
                                key={tab.id}
                                type="button"
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={
                                    isSelected
                                        ? "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                                        : "inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
                                }
                            >
                                <FaCreditCard className="text-xs opacity-80" />
                                {tab.label}
                                <span
                                    className={
                                        isSelected
                                            ? "rounded-full bg-white/20 px-2 py-0.5 text-xs"
                                            : "rounded-full bg-white/10 px-2 py-0.5 text-xs"
                                    }
                                >
                                    {loading ? "…" : count}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                <motion.div layout className={TABLE_WRAPPER}>
                    <div className={TABLE_TOOLBAR}>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                {activeTab === "EXPIRING"
                                    ? "Alertas de renovación"
                                    : "Suscripciones en operación"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatRecordCount(filteredSubscriptions.length, loading)}
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto lg:items-end">
                            <div className="relative flex-1 min-w-[220px]">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por empresa o plan…"
                                    className="input-field pl-10 h-11 w-full"
                                    aria-label="Buscar suscripciones"
                                />
                            </div>
                            <div className="w-full sm:w-52">
                                <SelectFloatingComponent
                                    label="Plan"
                                    name="planFilter"
                                    value={planFilter}
                                    onChange={(e) => setPlanFilter(e.target.value)}
                                    options={planOptions}
                                    required={false}
                                    className="mb-0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={THEAD}>
                                <tr>
                                    <th className={TH}>Empresa</th>
                                    <th className={TH}>Plan</th>
                                    <th className={TH}>Inicio</th>
                                    <th className={TH}>Vencimiento</th>
                                    <th className={TH}>Monto</th>
                                    <th className={TH}>Estado</th>
                                    <th className={`${TH} text-right`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={TBODY}>
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-14 text-center">
                                                <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                                    Cargando suscripciones…
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredSubscriptions.length === 0 ? (
                                        <motion.tr
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-500">
                                                No hay suscripciones que coincidan con los filtros aplicados.
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        filteredSubscriptions.map((sub) => {
                                            const daysLeft = daysUntil(sub.subscriptionEndDate);

                                            return (
                                                <motion.tr
                                                    key={sub.subscriptionId}
                                                    layout
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={TR_ROW}
                                                >
                                                    <td className={TD}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary shrink-0">
                                                                <FaBuilding className="text-sm" />
                                                            </span>
                                                            <div>
                                                                <p className="font-semibold text-dark">
                                                                    {sub.business?.businessName ?? "—"}
                                                                </p>
                                                                <p className="text-xs text-slate-400">
                                                                    {sub.subscriptionBusinessId?.slice(0, 8)}…
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={TD}>
                                                        {sub.plan?.planName ?? sub.subscriptionPlanId}
                                                    </td>
                                                    <td className={TD}>
                                                        {formatDate(sub.subscriptionStartDate)}
                                                    </td>
                                                    <td className={TD}>
                                                        <span>{formatDate(sub.subscriptionEndDate)}</span>
                                                        {daysLeft !== null && isSubscriptionActive(sub) && (
                                                            <span
                                                                className={`block text-xs mt-0.5 ${
                                                                    daysLeft <= EXPIRING_WINDOW_DAYS
                                                                        ? "text-amber-600 font-medium"
                                                                        : "text-slate-400"
                                                                }`}
                                                            >
                                                                {daysLeft === 0
                                                                    ? "Vence hoy"
                                                                    : `${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={TD_AMOUNT}>
                                                        {formatCurrency(sub.subscriptionAmount)}
                                                    </td>
                                                    <td className={TD}>
                                                        <SubscriptionStatusBadge sub={sub} />
                                                    </td>
                                                    <td className={`${TD} text-right`}>
                                                        <button
                                                            type="button"
                                                            className={ACTION_VIEW}
                                                            title="Detalle de suscripción (próximamente)"
                                                            aria-label="Ver suscripción"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </PageContainer>
    );
}

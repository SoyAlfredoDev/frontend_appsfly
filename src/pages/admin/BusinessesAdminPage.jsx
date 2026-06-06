import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaBuilding,
    FaUsers,
    FaCheckCircle,
    FaExclamationTriangle,
    FaUserSlash,
    FaDatabase,
    FaEye,
    FaCreditCard,
} from "react-icons/fa";
import { getAdminBusinesses } from "../../api/admin.js";
import formatDate from "../../utils/formatDate.js";
import formatName from "../../utils/formatName.js";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import KpiComponent from "../../components/KpiComponent.jsx";
import {
    TABLE_WRAPPER,
    TABLE_TOOLBAR,
    THEAD,
    TH,
    TBODY,
    TD,
    TR_ROW,
    ACTION_VIEW,
    formatRecordCount,
} from "../../utils/expenseUiPatterns.js";

const EXPIRING_WINDOW_DAYS = 7;

const TAB_OPTIONS = [
    { id: "ACTIVE", label: "Con plan activo" },
    { id: "PENDING", label: "Pendientes / por vencer" },
    { id: "NO_SUBSCRIPTION", label: "Sin suscripción" },
];

const BUSINESS_TYPE_LABELS = {
    optics: "Óptica",
    cafe: "Cafetería",
    veterinary: "Veterinaria",
    hair_salon: "Peluquería",
    clothing_store: "Tienda",
    minimarket: "Minimarket",
};

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
    return new Date(sub.subscriptionEndDate) > new Date();
}

function isExpiringSoon(sub) {
    if (!isSubscriptionActive(sub)) return false;
    const days = daysUntil(sub.subscriptionEndDate);
    return days !== null && days >= 0 && days <= EXPIRING_WINDOW_DAYS;
}

function getCommercialSegment(business) {
    const subs = business?.subscriptions ?? [];
    if (!subs.length) return "NO_SUBSCRIPTION";

    if (subs.some((s) => s.subscriptionStatus === "PENDIENT")) return "PENDING";

    const activeSubs = subs.filter(isSubscriptionActive);
    if (activeSubs.length) {
        const best = [...activeSubs].sort(
            (a, b) => new Date(b.subscriptionEndDate) - new Date(a.subscriptionEndDate),
        )[0];
        if (isExpiringSoon(best)) return "PENDING";
        return "ACTIVE";
    }

    return "NO_SUBSCRIPTION";
}

function getPrimarySubscription(business) {
    const subs = business?.subscriptions ?? [];
    if (!subs.length) return null;

    const activeSubs = subs.filter(isSubscriptionActive);
    if (activeSubs.length) {
        return [...activeSubs].sort(
            (a, b) => new Date(b.subscriptionEndDate) - new Date(a.subscriptionEndDate),
        )[0];
    }

    const pending = subs.find((s) => s.subscriptionStatus === "PENDIENT");
    if (pending) return pending;

    return subs[0];
}

function formatDbIdentifier(business) {
    const conn = business?.businessConnectionDB;
    if (conn) return conn.length > 14 ? `${conn.slice(0, 10)}…` : conn;
    const id = business?.businessId ?? "";
    return id ? `${id.slice(0, 8)}…` : "—";
}

function CommercialBadge({ segment }) {
    const styles = {
        ACTIVE: "border-primary/20 bg-primary/10 text-primary",
        PENDING: "border-amber-200 bg-amber-500/15 text-amber-700",
        NO_SUBSCRIPTION: "border-slate-200 bg-slate-100 text-slate-600",
    };
    const labels = {
        ACTIVE: "Activo",
        PENDING: "Pendiente",
        NO_SUBSCRIPTION: "Sin suscripción",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[segment] ?? styles.NO_SUBSCRIPTION}`}
        >
            {labels[segment] ?? segment}
        </span>
    );
}

export default function BusinessesAdminPage() {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("ACTIVE");
    const [searchQuery, setSearchQuery] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminBusinesses();
            setBusinesses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("[BusinessesAdmin]", err);
            setError("No se pudieron cargar los negocios de la plataforma.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const enrichedBusinesses = useMemo(
        () =>
            businesses.map((biz) => ({
                ...biz,
                commercialSegment: getCommercialSegment(biz),
                primarySubscription: getPrimarySubscription(biz),
                linkedUsersCount: biz._count?.UserBusiness ?? biz.UserBusiness?.length ?? 0,
            })),
        [businesses],
    );

    const metrics = useMemo(() => {
        const total = enrichedBusinesses.length;
        const active = enrichedBusinesses.filter((b) => b.commercialSegment === "ACTIVE").length;
        const pending = enrichedBusinesses.filter((b) => b.commercialSegment === "PENDING").length;
        const leads = enrichedBusinesses.filter((b) => b.commercialSegment === "NO_SUBSCRIPTION").length;
        return { total, active, pending, leads };
    }, [enrichedBusinesses]);

    const tabCounts = useMemo(
        () => ({
            ACTIVE: metrics.active,
            PENDING: metrics.pending,
            NO_SUBSCRIPTION: metrics.leads,
        }),
        [metrics],
    );

    const filteredBusinesses = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return enrichedBusinesses.filter((biz) => {
            if (biz.commercialSegment !== activeTab) return false;
            if (!query) return true;

            const haystack = [
                biz.businessName,
                biz.businessId,
                biz.businessConnectionDB,
                biz.businessEmail,
                biz.primarySubscription?.plan?.planName,
                BUSINESS_TYPE_LABELS[biz.businessType],
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [enrichedBusinesses, activeTab, searchQuery]);

    return (
        <PageContainer className="!bg-transparent">
            <div className="space-y-6">
                <PageHeader
                    title="Gestión de negocios y empresas"
                    subtitle="Inquilinos de la plataforma — segmentación comercial por estado de membresía"
                />

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiComponent
                        title="Empresas registradas"
                        icon={<FaBuilding />}
                        value={loading ? null : metrics.total}
                        footer="Total de tenants en GeneralDB"
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        title="Con plan activo"
                        icon={<FaCheckCircle />}
                        value={loading ? null : metrics.active}
                        footer="Operando al día con membresía"
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        title="Pendientes / por vencer"
                        icon={<FaExclamationTriangle />}
                        value={loading ? null : metrics.pending}
                        footer={`Renovación o vencimiento ≤ ${EXPIRING_WINDOW_DAYS} días`}
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        title="Leads sin suscripción"
                        icon={<FaUserSlash />}
                        value={loading ? null : metrics.leads}
                        footer="Remarketing y venta directa"
                        loading={loading}
                        isCurrency={false}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {TAB_OPTIONS.map((tab) => {
                        const isSelected = activeTab === tab.id;
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
                                <FaBuilding className="text-xs opacity-80" />
                                {tab.label}
                                <span
                                    className={
                                        isSelected
                                            ? "rounded-full bg-white/20 px-2 py-0.5 text-xs"
                                            : "rounded-full bg-white/10 px-2 py-0.5 text-xs"
                                    }
                                >
                                    {loading ? "…" : tabCounts[tab.id]}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                <motion.div layout className={TABLE_WRAPPER}>
                    <div className={TABLE_TOOLBAR}>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                {TAB_OPTIONS.find((t) => t.id === activeTab)?.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatRecordCount(filteredBusinesses.length, loading)}
                            </p>
                        </div>
                        <div className="relative flex-1 min-w-[220px] max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por empresa, tenant o plan…"
                                className="input-field pl-10 h-11 w-full"
                                aria-label="Buscar negocios"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={THEAD}>
                                <tr>
                                    <th className={TH}>Negocio</th>
                                    <th className={TH}>Conexión DB</th>
                                    <th className={TH}>Usuarios</th>
                                    <th className={TH}>Plan</th>
                                    <th className={TH}>Vencimiento</th>
                                    <th className={TH}>Estado comercial</th>
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
                                                    Cargando empresas…
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredBusinesses.length === 0 ? (
                                        <motion.tr
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-500">
                                                No hay empresas que coincidan con este segmento.
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        filteredBusinesses.map((biz) => {
                                            const sub = biz.primarySubscription;
                                            const daysLeft = sub
                                                ? daysUntil(sub.subscriptionEndDate)
                                                : null;

                                            return (
                                                <motion.tr
                                                    key={biz.businessId}
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
                                                                    {biz.businessName}
                                                                </p>
                                                                <p className="text-xs text-slate-400">
                                                                    {BUSINESS_TYPE_LABELS[biz.businessType] ??
                                                                        formatName(biz.businessType)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={TD}>
                                                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-500">
                                                            <FaDatabase className="text-slate-400" />
                                                            {formatDbIdentifier(biz)}
                                                        </span>
                                                    </td>
                                                    <td className={TD}>
                                                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-dark">
                                                            <FaUsers className="text-secondary text-xs" />
                                                            {biz.linkedUsersCount}
                                                        </span>
                                                    </td>
                                                    <td className={TD}>
                                                        {sub?.plan?.planName ?? sub?.subscriptionPlanId ?? "—"}
                                                    </td>
                                                    <td className={TD}>
                                                        {sub?.subscriptionEndDate ? (
                                                            <>
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
                                                                            : `${daysLeft} día${daysLeft !== 1 ? "s" : ""}`}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                    <td className={TD}>
                                                        <CommercialBadge segment={biz.commercialSegment} />
                                                    </td>
                                                    <td className={`${TD} text-right`}>
                                                        <div className="inline-flex items-center gap-1">
                                                            <Link
                                                                to={`/admin/businesses/${biz.businessId}`}
                                                                className={ACTION_VIEW}
                                                                title="Ver detalle 360°"
                                                                aria-label="Ver detalle del negocio"
                                                            >
                                                                <FaEye />
                                                            </Link>
                                                            <Link
                                                                to="/admin/subscriptions"
                                                                className="p-2 text-primary hover:text-primary-hover hover:bg-primary/10 rounded-lg transition-colors"
                                                                title="Gestionar suscripción"
                                                                aria-label="Editar suscripción"
                                                            >
                                                                <FaCreditCard />
                                                            </Link>
                                                        </div>
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

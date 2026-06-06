import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaArrowLeft,
    FaBuilding,
    FaUsers,
    FaCreditCard,
    FaChartLine,
    FaEnvelope,
    FaPhone,
    FaWhatsapp,
    FaDatabase,
    FaBoxOpen,
    FaReceipt,
    FaShoppingCart,
} from "react-icons/fa";
import { getAdminBusinessById } from "../../api/admin.js";
import formatDate from "../../utils/formatDate.js";
import formatCurrency from "../../utils/formatCurrency.js";
import formatName from "../../utils/formatName.js";
import { buildWhatsAppUrl } from "../../utils/providerContact.js";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import KpiComponent from "../../components/KpiComponent.jsx";
import {
    TABLE_WRAPPER,
    TABLE_TOOLBAR,
    THEAD,
    TH,
    TBODY,
    TD,
    TD_AMOUNT,
    TR_ROW,
    formatRecordCount,
} from "../../utils/expenseUiPatterns.js";

const EXPIRING_WINDOW_DAYS = 7;

const PANEL_TABS = [
    { id: "users", label: "Usuarios asociados", icon: FaUsers },
    { id: "payments", label: "Historial SaaS", icon: FaCreditCard },
    { id: "operations", label: "Movimientos tenant", icon: FaChartLine },
];

const BUSINESS_TYPE_LABELS = {
    optics: "Óptica",
    cafe: "Cafetería",
    veterinary: "Veterinaria",
    hair_salon: "Peluquería",
    clothing_store: "Tienda",
    minimarket: "Minimarket",
};

function formatDateTime(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return "—";
    return date.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
}

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

function getPrimarySubscription(subscriptions) {
    const subs = subscriptions ?? [];
    if (!subs.length) return null;
    const active = subs.filter(isSubscriptionActive);
    if (active.length) {
        return [...active].sort(
            (a, b) => new Date(b.subscriptionEndDate) - new Date(a.subscriptionEndDate),
        )[0];
    }
    return subs[0];
}

function SubscriptionBadge({ sub }) {
    if (!sub) {
        return (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Sin suscripción
            </span>
        );
    }
    if (isExpiringSoon(sub)) {
        return (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700">
                Pendiente / por vencer
            </span>
        );
    }
    if (isSubscriptionActive(sub)) {
        return (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Activo
            </span>
        );
    }
    const styles = {
        PENDIENT: "border-amber-200 bg-amber-500/15 text-amber-700",
        INACTIVE: "border-slate-200 bg-slate-100 text-slate-600",
        EXPIRED: "border-slate-200 bg-slate-100 text-slate-500",
        CANCELLED: "border-red-200 bg-red-500/10 text-red-600",
    };
    const labels = {
        PENDIENT: "Pendiente",
        INACTIVE: "Inactivo",
        EXPIRED: "Expirado",
        CANCELLED: "Cancelado",
    };
    const status = sub.subscriptionStatus;
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status] ?? styles.INACTIVE}`}
        >
            {labels[status] ?? status}
        </span>
    );
}

function PaymentStatusBadge({ status }) {
    const styles = {
        ACTIVE: "bg-primary/10 text-primary border-primary/20",
        PENDIENT: "bg-amber-500/15 text-amber-700 border-amber-200",
        INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
        EXPIRED: "bg-slate-100 text-slate-500 border-slate-200",
        CANCELLED: "bg-red-500/10 text-red-600 border-red-200",
    };
    const labels = {
        ACTIVE: "Pagado",
        PENDIENT: "Pendiente",
        INACTIVE: "Inactivo",
        EXPIRED: "Expirado",
        CANCELLED: "Cancelado",
    };
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] ?? styles.INACTIVE}`}
        >
            {labels[status] ?? status}
        </span>
    );
}

function ContactAction({ href, icon: Icon, label, variant = "secondary" }) {
    if (!href) return null;
    const classes =
        variant === "whatsapp"
            ? "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe57] transition-colors no-underline"
            : "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark hover:bg-slate-50 transition-colors no-underline";

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
            <Icon />
            {label}
        </a>
    );
}

export default function BusinessDetailAdminPage() {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePanel, setActivePanel] = useState("users");

    const loadDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminBusinessById(id);
            setDetail(res.data);
        } catch (err) {
            console.error("[BusinessDetailAdmin]", err);
            setError("No se pudo cargar el detalle del negocio.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadDetail();
    }, [loadDetail]);

    const business = detail?.business;
    const tenant = detail?.tenant;
    const subscriptions = business?.subscriptions ?? [];
    const primarySubscription = useMemo(
        () => getPrimarySubscription(subscriptions),
        [subscriptions],
    );

    const whatsappUrl = useMemo(() => {
        const code = business?.businessCodeWhatsappNumber || business?.businessCodePhoneNumber;
        const phone = business?.businessWhatsappNumber || business?.businessPhoneNumber;
        return buildWhatsAppUrl(code, phone);
    }, [business]);

    const adminEmail = business?.createdBy?.userEmail || business?.businessEmail;
    const mailtoHref = adminEmail ? `mailto:${adminEmail}` : null;
    const businessMailto = business?.businessEmail ? `mailto:${business.businessEmail}` : null;

    const taxLabel = useMemo(() => {
        const type = business?.businessDocumentType;
        const number = business?.businessDocumentNumber;
        if (!number) return "—";
        return `${type ? `${type}: ` : ""}${number}`;
    }, [business]);

    if (loading) {
        return (
            <PageContainer className="!bg-transparent">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="inline-flex items-center gap-3 text-sm text-white/70">
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        Cargando ficha 360°…
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (error || !business) {
        return (
            <PageContainer className="!bg-transparent">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-200">
                    {error ?? "Negocio no encontrado."}
                </div>
                <Link to="/admin/businesses" className="btn-ghost mt-4 inline-flex">
                    <FaArrowLeft />
                    Volver a empresas
                </Link>
            </PageContainer>
        );
    }

    const users = business.UserBusiness ?? [];
    const totals = tenant?.totals;
    const recentMovements = tenant?.recentMovements ?? [];

    return (
        <PageContainer className="!bg-transparent">
            <div className="space-y-6">
                <PageHeader
                    title={business.businessName}
                    subtitle={`${BUSINESS_TYPE_LABELS[business.businessType] ?? formatName(business.businessType)} · Registrado el ${formatDate(business.createdAt)}`}
                    actions={
                        <Link to="/admin/businesses" className="btn-ghost shrink-0">
                            <FaArrowLeft />
                            Volver a empresas
                        </Link>
                    }
                />

                {tenant?.available && totals && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <KpiComponent
                            title="Ventas registradas"
                            icon={<FaShoppingCart />}
                            value={totals.totalSales}
                            footer={`Volumen: ${formatCurrency(totals.salesVolume)}`}
                            loading={false}
                            isCurrency={false}
                        />
                        <KpiComponent
                            title="Productos en inventario"
                            icon={<FaBoxOpen />}
                            value={totals.totalProducts}
                            footer="Catálogo activo del tenant"
                            loading={false}
                            isCurrency={false}
                        />
                        <KpiComponent
                            title="Gastos operativos"
                            icon={<FaReceipt />}
                            value={totals.totalExpenses}
                            footer="Registros en base tenant"
                            loading={false}
                            isCurrency={false}
                        />
                        <KpiComponent
                            title="Clientes del negocio"
                            icon={<FaUsers />}
                            value={totals.totalCustomers}
                            footer="Base de clientes del tenant"
                            loading={false}
                            isCurrency={false}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,34%)]">
                    <div className="space-y-4 min-w-0">
                        <div className="flex flex-wrap gap-2">
                            {PANEL_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const selected = activePanel === tab.id;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActivePanel(tab.id)}
                                        className={
                                            selected
                                                ? "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                                                : "inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
                                        }
                                    >
                                        <Icon className="text-xs" />
                                        {tab.label}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activePanel}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22 }}
                                className={TABLE_WRAPPER}
                            >
                                {activePanel === "users" && (
                                    <>
                                        <div className={TABLE_TOOLBAR}>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Colaboradores vinculados
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {formatRecordCount(users.length)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className={THEAD}>
                                                    <tr>
                                                        <th className={TH}>Nombre</th>
                                                        <th className={TH}>Correo</th>
                                                        <th className={TH}>Teléfono</th>
                                                        <th className={TH}>Rol</th>
                                                        <th className={TH}>Última conexión</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={TBODY}>
                                                    {users.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                                                                Sin usuarios asociados.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        users.map((link) => (
                                                            <tr
                                                                key={`${link.userBusinessUserId}-${link.userBusinessBusinessId}`}
                                                                className={TR_ROW}
                                                            >
                                                                <td className={`${TD} font-semibold text-dark`}>
                                                                    {link.User?.userFirstName} {link.User?.userLastName}
                                                                </td>
                                                                <td className={TD}>{link.User?.userEmail ?? "—"}</td>
                                                                <td className={TD}>
                                                                    {link.User?.userCodePhoneNumber}{" "}
                                                                    {link.User?.userPhoneNumber || "—"}
                                                                </td>
                                                                <td className={TD}>
                                                                    <span className="badge-secondary">
                                                                        {link.userBusinessRole}
                                                                    </span>
                                                                </td>
                                                                <td className={TD}>
                                                                    {formatDateTime(link.User?.userLastConnection)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}

                                {activePanel === "payments" && (
                                    <>
                                        <div className={TABLE_TOOLBAR}>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Historial de pagos SaaS
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {formatRecordCount(subscriptions.length)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className={THEAD}>
                                                    <tr>
                                                        <th className={TH}>Fecha</th>
                                                        <th className={TH}>Nro. transacción</th>
                                                        <th className={TH}>Método</th>
                                                        <th className={TH}>Monto</th>
                                                        <th className={TH}>Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={TBODY}>
                                                    {subscriptions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                                                                Sin historial de membresías.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        subscriptions.map((sub) => (
                                                            <tr key={sub.subscriptionId} className={TR_ROW}>
                                                                <td className={TD}>
                                                                    {formatDate(sub.subscriptionStartDate ?? sub.createdAt)}
                                                                </td>
                                                                <td className={`${TD} font-mono text-xs text-slate-500`}>
                                                                    {sub.subscriptionId.slice(0, 12)}…
                                                                </td>
                                                                <td className={TD}>
                                                                    {sub.subscriptionPaymentMethod || "—"}
                                                                </td>
                                                                <td className={TD_AMOUNT}>
                                                                    {formatCurrency(sub.subscriptionAmount)}
                                                                </td>
                                                                <td className={TD}>
                                                                    <PaymentStatusBadge status={sub.subscriptionStatus} />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}

                                {activePanel === "operations" && (
                                    <>
                                        <div className={TABLE_TOOLBAR}>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Últimos movimientos operativos
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {tenant?.available
                                                        ? formatRecordCount(recentMovements.length)
                                                        : "Base tenant no disponible"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className={THEAD}>
                                                    <tr>
                                                        <th className={TH}>Fecha</th>
                                                        <th className={TH}>Tipo</th>
                                                        <th className={TH}>Descripción</th>
                                                        <th className={TH}>Monto</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={TBODY}>
                                                    {!tenant?.available ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                                                                La base de datos del tenant aún no está configurada o no es accesible.
                                                            </td>
                                                        </tr>
                                                    ) : recentMovements.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                                                                Sin movimientos recientes en el tenant.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        recentMovements.map((move) => (
                                                            <tr key={`${move.type}-${move.id}`} className={TR_ROW}>
                                                                <td className={TD}>{formatDateTime(move.date)}</td>
                                                                <td className={TD}>
                                                                    <span className="badge bg-slate-100 text-slate-600">
                                                                        {move.type}
                                                                    </span>
                                                                </td>
                                                                <td className={TD}>{move.label}</td>
                                                                <td className={TD_AMOUNT}>
                                                                    {move.amount != null
                                                                        ? formatCurrency(move.amount)
                                                                        : "—"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                        <motion.div
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-xl border border-white/10 bg-white p-5 shadow-xl"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary shrink-0">
                                    <FaBuilding />
                                </span>
                                <div>
                                    <h2 className="font-display text-lg font-bold text-dark">
                                        Ficha comercial
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Contacto directo y prospección
                                    </p>
                                </div>
                            </div>

                            <dl className="space-y-3 text-sm mb-5">
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">RUT / Tax ID</dt>
                                    <dd className="font-semibold text-dark mt-0.5">{taxLabel}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">Registro</dt>
                                    <dd className="text-dark mt-0.5">{formatDateTime(business.createdAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">País</dt>
                                    <dd className="text-dark mt-0.5">{formatName(business.businessCountry)}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">Tenant DB</dt>
                                    <dd className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-xs text-slate-500">
                                        <FaDatabase />
                                        {business.businessConnectionDB
                                            ? `${business.businessConnectionDB.slice(0, 14)}…`
                                            : "Sin conexión"}
                                    </dd>
                                </div>
                            </dl>

                            <div className="space-y-2 border-t border-slate-100 pt-4">
                                <ContactAction
                                    href={whatsappUrl}
                                    icon={FaWhatsapp}
                                    label="WhatsApp directo"
                                    variant="whatsapp"
                                />
                                <ContactAction
                                    href={businessMailto}
                                    icon={FaEnvelope}
                                    label={`Email empresa${business.businessEmail ? "" : ""}`}
                                />
                                <ContactAction
                                    href={mailtoHref}
                                    icon={FaEnvelope}
                                    label="Email administrador"
                                />
                                {(business.businessCodePhoneNumber || business.businessPhoneNumber) && (
                                    <p className="flex items-center gap-2 text-xs text-slate-500 px-1 pt-1">
                                        <FaPhone className="text-secondary" />
                                        {business.businessCodePhoneNumber} {business.businessPhoneNumber}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 }}
                            className="rounded-xl border border-white/10 bg-dark-muted p-5 shadow-xl"
                        >
                            <h3 className="font-display text-sm font-semibold text-white mb-3">
                                Suscripción actual
                            </h3>
                            <div className="mb-3">
                                <SubscriptionBadge sub={primarySubscription} />
                            </div>
                            {primarySubscription ? (
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-white/40">Plan</dt>
                                        <dd className="text-white font-medium mt-0.5">
                                            {primarySubscription.plan?.planName ??
                                                primarySubscription.subscriptionPlanId}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-white/40">Vencimiento</dt>
                                        <dd className="text-white font-medium mt-0.5">
                                            {formatDate(primarySubscription.subscriptionEndDate)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-white/40">Monto</dt>
                                        <dd className="text-primary font-semibold mt-0.5">
                                            {formatCurrency(primarySubscription.subscriptionAmount)}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-sm text-white/50">
                                    Este negocio no tiene una membresía activa registrada.
                                </p>
                            )}
                            <Link
                                to="/admin/subscriptions"
                                className="btn-primary w-full mt-4 text-center no-underline"
                            >
                                Gestionar suscripciones
                            </Link>
                        </motion.div>
                    </aside>
                </div>
            </div>
        </PageContainer>
    );
}

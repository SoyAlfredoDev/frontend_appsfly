import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaBell,
    FaCheck,
    FaCheckDouble,
    FaBroom,
    FaEnvelope,
    FaExclamationTriangle,
    FaRobot,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import {
    clearAdminNotificationsRequest,
    getAdminNotificationsRequest,
    markAdminNotificationReadRequest,
    markAllAdminNotificationsReadRequest,
} from "../../api/adminNotifications.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import { useAdminNotifications } from "../../context/AdminNotificationsContext.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

function typeIcon(type) {
    switch (type) {
        case "CAMPAIGN_FAILED":
            return <FaExclamationTriangle className="text-red-500" />;
        case "CAMPAIGN_SKIPPED":
            return <FaBell className="text-amber-500" />;
        case "CAMPAIGN_AUTO_RUN":
            return <FaRobot className="text-secondary" />;
        default:
            return <FaEnvelope className="text-primary" />;
    }
}

function formatWhen(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function NotificationsAdminPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const { setUnreadCount, refreshUnreadCount } = useAdminNotifications();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminNotificationsRequest();
            setNotifications(res.data?.notifications ?? []);
            const count = res.data?.unreadCount ?? 0;
            setLocalUnreadCount(count);
            setUnreadCount(count);
        } catch {
            toast.error("Error", "No se pudieron cargar las notificaciones.");
        } finally {
            setLoading(false);
        }
    }, [toast, setUnreadCount]);

    useEffect(() => {
        load();
    }, [load]);

    const handleMarkRead = async (id) => {
        try {
            await markAdminNotificationReadRequest(id);
            setLocalUnreadCount((c) => Math.max(0, c - 1));
            setUnreadCount((c) => Math.max(0, c - 1));
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notificationId === id ? { ...n, isRead: true } : n,
                ),
            );
            await refreshUnreadCount();
        } catch {
            toast.error("Error", "No se pudo marcar como leída.");
            await refreshUnreadCount();
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAdminNotificationsReadRequest();
            setLocalUnreadCount(0);
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            toast.success("Listo", "Todas las notificaciones marcadas como leídas.");
            await refreshUnreadCount();
        } catch {
            toast.error("Error", "No se pudieron marcar las notificaciones.");
            await refreshUnreadCount();
        }
    };

    const handleClear = async (mode) => {
        const ok = await confirm({
            title: mode === "all" ? "Limpiar todo" : "Limpiar leídas",
            message:
                mode === "all"
                    ? "¿Eliminar todas las notificaciones?"
                    : "¿Eliminar solo las notificaciones ya leídas?",
            variant: "danger",
            confirmText: "Limpiar",
            cancelText: "Cancelar",
        });
        if (!ok) return;

        try {
            await clearAdminNotificationsRequest(mode);
            toast.success("Limpio", "Panel de notificaciones actualizado.");
            await load();
            await refreshUnreadCount();
        } catch {
            toast.error("Error", "No se pudo limpiar el panel.");
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Notificaciones"
                subtitle="Resumen de campañas automáticas y envíos del panel admin."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={handleMarkAllRead} className={PRIMARY_BTN}>
                            <FaCheckDouble /> Marcar todas leídas
                        </button>
                        <button
                            type="button"
                            onClick={() => handleClear("read")}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <FaBroom /> Limpiar leídas
                        </button>
                    </div>
                }
            />

            {unreadCount > 0 && (
                <p className="mb-4 text-sm text-primary font-medium">
                    {unreadCount} notificación{unreadCount > 1 ? "es" : ""} sin leer
                </p>
            )}

            {loading ? (
                <div className="py-16 text-center text-slate-400">Cargando…</div>
            ) : notifications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                    <FaBell className="mx-auto text-3xl text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium">Sin notificaciones</p>
                    <p className="text-sm text-slate-400 mt-1">
                        Cuando una campaña se ejecute, verás aquí el resumen.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <motion.div
                            key={n.notificationId}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-xl border p-4 shadow-sm ${
                                n.isRead
                                    ? "border-gray-100 bg-white"
                                    : "border-primary/20 bg-primary/5"
                            }`}
                        >
                            <div className="flex gap-3 items-start">
                                <div className="mt-0.5 shrink-0">{typeIcon(n.notificationType)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            {n.title}
                                        </h3>
                                        {!n.isRead && (
                                            <span className="text-[10px] uppercase tracking-wide font-bold text-primary">
                                                Nueva
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                                    {n.payload && (
                                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                                            {n.payload.sentCount != null && (
                                                <span>Enviados: {n.payload.sentCount}</span>
                                            )}
                                            {n.payload.deliveredCount != null && (
                                                <span>Entregados: {n.payload.deliveredCount}</span>
                                            )}
                                            {n.payload.failedCount != null && (
                                                <span>Fallidos: {n.payload.failedCount}</span>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-400 mt-2">
                                        {formatWhen(n.createdAt)}
                                    </p>
                                    {n.campaignId && (
                                        <Link
                                            to={`/admin/email-campaigns/${n.campaignId}/history`}
                                            className="text-xs font-medium text-secondary hover:text-secondary/80 no-underline mt-2 inline-block"
                                        >
                                            Ver campaña →
                                        </Link>
                                    )}
                                </div>
                                {!n.isRead && (
                                    <button
                                        type="button"
                                        onClick={() => handleMarkRead(n.notificationId)}
                                        className="shrink-0 rounded-lg border border-gray-200 p-2 text-slate-500 hover:bg-slate-50"
                                        title="Marcar como leída"
                                    >
                                        <FaCheck />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}

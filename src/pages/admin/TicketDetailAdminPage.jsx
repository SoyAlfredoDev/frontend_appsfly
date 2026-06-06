import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaArrowLeft,
    FaBuilding,
    FaClock,
    FaHeadset,
    FaPaperPlane,
    FaStickyNote,
    FaTag,
    FaUser,
} from "react-icons/fa";
import { getTicketById, updateTicketStatus } from "../../api/ticket.js";
import { createTicketDetail } from "../../api/ticketDetail.js";
import { getBusiness } from "../../api/business.js";
import formatDate from "../../utils/formatDate.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pendiente" },
    { value: "URGENT", label: "Urgente" },
    { value: "IN_PROGRESS", label: "En proceso" },
    { value: "RESOLVED", label: "Resuelto" },
];

const TYPE_LABELS = {
    SUPPORT: "Soporte",
    SUGGESTION: "Sugerencia",
    REQUEST: "Solicitud",
};

function formatDateTime(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
}

function resolveBusinessId(ticket) {
    const userId = ticket?.createdBy?.userId;
    const associated = ticket?.ticketAssociatedTo ?? [];
    return associated.find((item) => item && item !== userId) ?? null;
}

function getPriorityMeta(ticket) {
    if (ticket?.ticketStatus === "URGENT") {
        return { label: "Alta", className: "bg-red-500/15 text-red-400 border-red-500/30" };
    }
    if (ticket?.ticketStatus === "PENDING") {
        return { label: "Media", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    }
    if (ticket?.ticketStatus === "IN_PROGRESS") {
        return { label: "Normal", className: "bg-secondary/15 text-blue-300 border-secondary/30" };
    }
    return { label: "Baja", className: "bg-white/10 text-slate-300 border-white/15" };
}

function StatusBadge({ status }) {
    const styles = {
        RESOLVED: "bg-primary/15 text-primary border-primary/30",
        PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        IN_PROGRESS: "bg-secondary/15 text-blue-300 border-secondary/30",
        URGENT: "bg-red-500/15 text-red-400 border-red-500/30",
    };
    const labels = {
        RESOLVED: "Resuelto",
        PENDING: "Pendiente",
        IN_PROGRESS: "En proceso",
        URGENT: "Urgente",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold font-display ${styles[status] ?? "bg-white/10 text-slate-300 border-white/15"}`}
        >
            {labels[status] ?? status}
        </span>
    );
}

function isInternalNote(content) {
    return typeof content === "string" && content.startsWith("[NOTA INTERNA]");
}

function stripInternalPrefix(content) {
    return content.replace(/^\[NOTA INTERNA\]\n?/, "");
}

function Avatar({ name, variant = "customer" }) {
    const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
    const styles = {
        customer: "bg-secondary/20 text-blue-200 border-secondary/30",
        support: "bg-primary/20 text-primary border-primary/30",
        internal: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    };

    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${styles[variant]}`}
        >
            {initial}
        </div>
    );
}

function TimelineMessage({ detail, ticket }) {
    const isAppsFly = detail.ticketDetailOrigin === "APPSFLY";
    const internal = isAppsFly && isInternalNote(detail.ticketDetailContent);
    const content = internal
        ? stripInternalPrefix(detail.ticketDetailContent)
        : detail.ticketDetailContent;

    const author = isAppsFly
        ? internal
            ? "Nota interna — AppsFly"
            : `${detail.createdBy?.userFirstName ?? "Soporte"} ${detail.createdBy?.userLastName ?? "AppsFly"}`.trim()
        : `${ticket.createdBy?.userFirstName ?? "Cliente"} ${ticket.createdBy?.userLastName ?? ""}`.trim();

    const email = isAppsFly ? detail.createdBy?.userEmail : ticket.createdBy?.userEmail;
    const variant = internal ? "internal" : isAppsFly ? "support" : "customer";

    const bubbleStyles = internal
        ? "border border-amber-500/30 bg-amber-500/10 text-amber-50"
        : isAppsFly
          ? "border border-primary/30 bg-primary/15 text-white"
          : "border border-white/10 bg-white text-slate-800";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex gap-3 ${isAppsFly ? "flex-row-reverse" : "flex-row"}`}
        >
            <Avatar name={author} variant={variant} />
            <div className={`max-w-[85%] sm:max-w-[75%] ${isAppsFly ? "text-right" : "text-left"}`}>
                <div className={`mb-1 flex flex-wrap items-center gap-2 text-xs ${isAppsFly ? "justify-end" : "justify-start"}`}>
                    <span className="font-semibold text-white/90">{author}</span>
                    {email && <span className="text-white/40">{email}</span>}
                    <span className="inline-flex items-center gap-1 text-white/40">
                        <FaClock className="text-[10px]" />
                        {formatDateTime(detail.createdAt)}
                    </span>
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${bubbleStyles}`}>
                    <p className="whitespace-pre-wrap break-words">{content}</p>
                    {detail.ticketDetailImage?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {detail.ticketDetailImage.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="Adjunto"
                                    className="max-h-40 rounded-lg border border-white/10 object-cover"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function TicketDetailAdminPage() {
    const { id } = useParams();
    const toast = useToast();

    const [ticket, setTicket] = useState(null);
    const [businessMap, setBusinessMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const loadTicket = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ticketRes, businessRes] = await Promise.all([
                getTicketById(id),
                getBusiness(),
            ]);

            const businessList = Array.isArray(businessRes.data) ? businessRes.data : [];
            const map = businessList.reduce((acc, item) => {
                if (item?.businessId) {
                    acc[item.businessId] = item.businessName ?? item.businessId;
                }
                return acc;
            }, {});

            setBusinessMap(map);
            setTicket(ticketRes.data);
        } catch (err) {
            console.error("[TicketDetailAdmin]", err);
            setError("Error al cargar el ticket.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadTicket();
    }, [loadTicket]);

    const businessName = useMemo(() => {
        if (!ticket) return "—";
        const businessId = resolveBusinessId(ticket);
        return businessMap[businessId] ?? businessId ?? "—";
    }, [ticket, businessMap]);

    const priority = useMemo(() => (ticket ? getPriorityMeta(ticket) : null), [ticket]);

    const ticketTitle = useMemo(() => {
        if (!ticket) return "";
        if (ticket.ticketSubject) return ticket.ticketSubject;
        return `Ticket #${ticket.ticketNumber ?? ticket.ticketId.slice(0, 8)}`;
    }, [ticket]);

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;
        if (!ticket || newStatus === ticket.ticketStatus) return;

        setStatusUpdating(true);
        try {
            const response = await updateTicketStatus(id, newStatus);
            setTicket(response.data);
            toast.success("Estado actualizado", "El ticket se actualizó correctamente.");
        } catch (err) {
            console.error(err);
            toast.error("Error", "No se pudo actualizar el estado del ticket.");
        } finally {
            setStatusUpdating(false);
        }
    };

    const sendReply = async ({ internal = false, closeTicket = false }) => {
        const trimmed = replyText.trim();
        if (!trimmed) {
            toast.info("Mensaje vacío", "Escribe una respuesta antes de enviar.");
            return;
        }

        setSubmitting(true);
        try {
            const content = internal ? `[NOTA INTERNA]\n${trimmed}` : trimmed;

            await createTicketDetail({
                ticketId: id,
                ticketAssociatedTo: ticket?.ticketAssociatedTo ?? [],
                ticketDetailContent: content,
                ticketDetailImage: [],
                ticketDetailOrigin: "APPSFLY",
            });

            if (closeTicket) {
                const statusRes = await updateTicketStatus(id, "RESOLVED");
                setTicket(statusRes.data);
            } else {
                const refreshed = await getTicketById(id);
                setTicket(refreshed.data);
            }

            setReplyText("");
            toast.success(
                closeTicket ? "Ticket cerrado" : internal ? "Nota guardada" : "Respuesta enviada",
                closeTicket
                    ? "La respuesta se envió al cliente y el ticket quedó resuelto."
                    : internal
                      ? "La nota interna quedó registrada en el historial."
                      : "El cliente verá tu respuesta en el hilo del ticket.",
            );
        } catch (err) {
            console.error(err);
            toast.error("Error", "No se pudo registrar la respuesta.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PageContainer className="!bg-transparent">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="inline-flex items-center gap-3 text-sm text-white/70">
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        Cargando ticket…
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer className="!bg-transparent">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-200">
                    {error}
                </div>
            </PageContainer>
        );
    }

    if (!ticket) {
        return (
            <PageContainer className="!bg-transparent">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
                    Ticket no encontrado.
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="!bg-transparent">
                <div className="space-y-6">
                    <PageHeader
                        title={
                            <span className="flex flex-wrap items-center gap-3">
                                <span className="font-display">{ticketTitle}</span>
                                <StatusBadge status={ticket.ticketStatus} />
                            </span>
                        }
                        subtitle={`ID ${ticket.ticketNumber ?? ticket.ticketId.slice(0, 8)} · Abierto el ${formatDate(ticket.createdAt)}`}
                        actions={
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <Link to="/admin/tickets" className="btn-ghost shrink-0">
                                    <FaArrowLeft />
                                    Volver a tickets
                                </Link>
                                <select
                                    value={ticket.ticketStatus}
                                    onChange={handleStatusChange}
                                    disabled={statusUpdating}
                                    className="select-field h-11 min-w-[160px] disabled:opacity-60"
                                    aria-label="Cambiar estado del ticket"
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,32%)]">
                        <div className="space-y-6 min-w-0">
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-dark-muted shadow-xl">
                                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
                                    <FaHeadset className="text-primary" />
                                    <h2 className="font-display text-base font-semibold text-white">
                                        Historial de conversación
                                    </h2>
                                </div>
                                <div className="max-h-[min(520px,55vh)] space-y-5 overflow-y-auto px-5 py-5">
                                    {ticket.ticketDetails?.length > 0 ? (
                                        ticket.ticketDetails.map((detail) => (
                                            <TimelineMessage
                                                key={detail.ticketDetailId}
                                                detail={detail}
                                                ticket={ticket}
                                            />
                                        ))
                                    ) : (
                                        <p className="py-12 text-center text-sm text-white/50">
                                            No hay mensajes en este ticket.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white p-5 shadow-xl">
                                <h3 className="mb-4 font-display text-sm font-semibold text-dark">
                                    Respuesta administrativa
                                </h3>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Escribe una respuesta para el cliente o una nota interna del equipo…"
                                    rows={4}
                                    disabled={submitting}
                                    className="input-field min-h-[120px] resize-y disabled:opacity-60"
                                />
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={submitting}
                                        onClick={() => sendReply({ internal: true })}
                                        className="btn-ghost flex-1 sm:flex-none"
                                    >
                                        <FaStickyNote />
                                        Guardar nota interna
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={submitting}
                                        onClick={() => sendReply({ internal: false })}
                                        className="btn-secondary flex-1 sm:flex-none"
                                    >
                                        <FaPaperPlane />
                                        Enviar respuesta al cliente
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={submitting}
                                        onClick={() => sendReply({ internal: false, closeTicket: true })}
                                        className="btn-primary flex-1 sm:flex-none"
                                    >
                                        <FaPaperPlane />
                                        Enviar y cerrar ticket
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-xl border border-white/10 bg-dark-muted p-5 shadow-xl">
                                <h3 className="mb-4 font-display text-sm font-semibold text-white">
                                    Información del tenant
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 text-blue-300">
                                            <FaBuilding />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-white/40">Empresa</p>
                                            <p className="text-sm font-semibold text-white">{businessName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                            <FaUser />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-white/40">
                                                Usuario de contacto
                                            </p>
                                            <p className="text-sm font-semibold text-white">
                                                {ticket.createdBy?.userFirstName} {ticket.createdBy?.userLastName}
                                            </p>
                                            <p className="text-xs text-white/50">{ticket.createdBy?.userEmail}</p>
                                            {ticket.createdBy?.userPhoneNumber && (
                                                <p className="text-xs text-white/50 mt-0.5">
                                                    {ticket.createdBy.userPhoneNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-white/40">Prioridad</p>
                                            {priority && (
                                                <span
                                                    className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priority.className}`}
                                                >
                                                    {priority.label}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-white/40">Categoría</p>
                                            <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-white">
                                                <FaTag className="text-primary text-xs" />
                                                {TYPE_LABELS[ticket.ticketType] ?? ticket.ticketType}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-4">
                                        <p className="text-xs uppercase tracking-wide text-white/40">Fecha de apertura</p>
                                        <p className="mt-1 text-sm font-medium text-white">
                                            {formatDateTime(ticket.createdAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-white/40">Estado actual</p>
                                        <div className="mt-2">
                                            <StatusBadge status={ticket.ticketStatus} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
        </PageContainer>
    );
}

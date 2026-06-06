import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaEye,
    FaTicketAlt,
    FaExclamationTriangle,
    FaCheckCircle,
    FaInbox,
    FaSearch,
    FaBuilding,
} from "react-icons/fa";
import { getTickets } from "../../api/ticket.js";
import { getBusiness } from "../../api/business.js";
import formatDate from "../../utils/formatDate.js";
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
    TR_ROW,
    ACTION_VIEW,
    formatRecordCount,
} from "../../utils/expenseUiPatterns.js";

const STATUS_OPTIONS = [
    { value: "ALL", label: "Todos los estados" },
    { value: "PENDING", label: "Pendiente" },
    { value: "URGENT", label: "Urgente" },
    { value: "IN_PROGRESS", label: "En proceso" },
    { value: "RESOLVED", label: "Resuelto" },
];

const TYPE_OPTIONS = [
    { value: "ALL", label: "Todos los tipos" },
    { value: "SUPPORT", label: "Soporte" },
    { value: "SUGGESTION", label: "Sugerencia" },
    { value: "REQUEST", label: "Solicitud" },
];

function isToday(dateValue) {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

function resolveBusinessId(ticket) {
    const userId = ticket?.createdBy?.userId;
    const associated = ticket?.ticketAssociatedTo ?? [];
    return associated.find((id) => id && id !== userId) ?? null;
}

function getPriorityMeta(ticket) {
    if (ticket?.ticketStatus === "URGENT") {
        return { label: "Alta", className: "bg-red-500/15 text-red-600 border-red-200" };
    }
    if (ticket?.ticketStatus === "PENDING") {
        return { label: "Media", className: "bg-amber-500/15 text-amber-700 border-amber-200" };
    }
    if (ticket?.ticketStatus === "IN_PROGRESS") {
        return { label: "Normal", className: "bg-secondary/10 text-secondary border-blue-200" };
    }
    return { label: "Baja", className: "bg-slate-100 text-slate-600 border-slate-200" };
}

function StatusBadge({ status }) {
    const styles = {
        RESOLVED: "bg-primary/10 text-primary border-primary/20",
        PENDING: "bg-amber-500/15 text-amber-700 border-amber-200",
        IN_PROGRESS: "bg-secondary/10 text-secondary border-blue-200",
        URGENT: "bg-red-500/15 text-red-600 border-red-200",
    };
    const labels = {
        RESOLVED: "Resuelto",
        PENDING: "Pendiente",
        IN_PROGRESS: "En proceso",
        URGENT: "Urgente",
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
            {labels[status] ?? status}
        </span>
    );
}

function TypeBadge({ type }) {
    const labels = {
        SUPPORT: "Soporte",
        SUGGESTION: "Sugerencia",
        REQUEST: "Solicitud",
    };
    return (
        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-medium">
            {labels[type] ?? type}
        </span>
    );
}

export default function TicketsAdminPage() {
    const [tickets, setTickets] = useState([]);
    const [businessMap, setBusinessMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ticketsRes, businessRes] = await Promise.all([
                getTickets(),
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
            setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        } catch (err) {
            console.error("[TicketsAdmin]", err);
            setError("No se pudieron cargar los tickets de soporte.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const metrics = useMemo(() => {
        const active = tickets.filter((t) => t.ticketStatus !== "RESOLVED").length;
        const urgentPending = tickets.filter(
            (t) => t.ticketStatus === "URGENT" || t.ticketStatus === "PENDING",
        ).length;
        const resolvedToday = tickets.filter(
            (t) => t.ticketStatus === "RESOLVED" && isToday(t.updatedAt ?? t.createdAt),
        ).length;
        return { active, urgentPending, resolvedToday, total: tickets.length };
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return tickets.filter((ticket) => {
            if (statusFilter !== "ALL" && ticket.ticketStatus !== statusFilter) {
                return false;
            }
            if (typeFilter !== "ALL" && ticket.ticketType !== typeFilter) {
                return false;
            }
            if (!query) return true;

            const businessId = resolveBusinessId(ticket);
            const businessName = businessMap[businessId] ?? "";
            const haystack = [
                ticket.ticketNumber,
                ticket.ticketId,
                ticket.ticketSubject,
                ticket.createdBy?.userFirstName,
                ticket.createdBy?.userLastName,
                ticket.createdBy?.userEmail,
                businessName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [tickets, searchQuery, statusFilter, typeFilter, businessMap]);

    return (
        <PageContainer className="!bg-transparent">
            <div className="space-y-6">
                <PageHeader
                    title="Gestión de Tickets"
                    subtitle="Panel corporativo de soporte — monitoreo y resolución de incidencias"
                />

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <KpiComponent
                            title="Tickets activos"
                            icon={<FaInbox />}
                            value={loading ? null : metrics.active}
                            footer="Abiertos o en gestión"
                            loading={loading}
                            isCurrency={false}
                        />
                        <KpiComponent
                            title="Pendientes / urgentes"
                            icon={<FaExclamationTriangle />}
                            value={loading ? null : metrics.urgentPending}
                            footer="Requieren atención prioritaria"
                            loading={loading}
                            isCurrency={false}
                        />
                        <KpiComponent
                            title="Resueltos hoy"
                            icon={<FaCheckCircle />}
                            value={loading ? null : metrics.resolvedToday}
                            footer="Cerrados en las últimas 24h"
                            loading={loading}
                            isCurrency={false}
                        />
                        <KpiComponent
                            title="Total registrados"
                            icon={<FaTicketAlt />}
                            value={loading ? null : metrics.total}
                            footer="Histórico en plataforma"
                            loading={loading}
                            isCurrency={false}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={TABLE_WRAPPER}
                    >
                        <div className={TABLE_TOOLBAR}>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Bandeja de tickets</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {formatRecordCount(filteredTickets.length, loading)}
                                </p>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto lg:items-end">
                                <div className="relative flex-1 min-w-[220px]">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar por ID, asunto, cliente o empresa…"
                                        className="input-field pl-10 h-11 w-full"
                                        aria-label="Buscar tickets"
                                    />
                                </div>
                                <div className="w-full sm:w-52">
                                    <SelectFloatingComponent
                                        label="Estado"
                                        name="statusFilter"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        options={STATUS_OPTIONS}
                                        required={false}
                                        className="mb-0"
                                    />
                                </div>
                                <div className="w-full sm:w-52">
                                    <SelectFloatingComponent
                                        label="Tipo"
                                        name="typeFilter"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        options={TYPE_OPTIONS}
                                        required={false}
                                        className="mb-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mx-6 mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className={THEAD}>
                                    <tr>
                                        <th className={TH}>Ticket</th>
                                        <th className={TH}>Cliente / Tenant</th>
                                        <th className={TH}>Asunto</th>
                                        <th className={TH}>Fecha</th>
                                        <th className={TH}>Estado</th>
                                        <th className={TH}>Prioridad</th>
                                        <th className={`${TH} text-right`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={TBODY}>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-14 text-center">
                                                <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                                                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                    Cargando tickets…
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredTickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-500">
                                                No hay tickets que coincidan con los filtros aplicados.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTickets.map((ticket, index) => {
                                            const businessId = resolveBusinessId(ticket);
                                            const businessName = businessMap[businessId] ?? "Sin empresa";
                                            const priority = getPriorityMeta(ticket);

                                            return (
                                                <motion.tr
                                                    key={ticket.ticketId}
                                                    className={TR_ROW}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                                >
                                                    <td className={TD}>
                                                        <span className="font-semibold text-secondary">
                                                            #{ticket.ticketNumber || ticket.ticketId?.slice(0, 8)}
                                                        </span>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            <TypeBadge type={ticket.ticketType} />
                                                        </p>
                                                    </td>
                                                    <td className={TD}>
                                                        <p className="font-medium text-slate-800">
                                                            {ticket.createdBy?.userFirstName} {ticket.createdBy?.userLastName}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{ticket.createdBy?.userEmail}</p>
                                                        <p className="text-xs text-primary mt-1 inline-flex items-center gap-1">
                                                            <FaBuilding className="text-[10px]" />
                                                            {businessName}
                                                        </p>
                                                    </td>
                                                    <td className={TD}>
                                                        <p className="text-slate-700 max-w-xs truncate" title={ticket.ticketSubject}>
                                                            {ticket.ticketSubject || "Sin asunto"}
                                                        </p>
                                                    </td>
                                                    <td className={`${TD} whitespace-nowrap`}>
                                                        {formatDate(ticket.createdAt)}
                                                    </td>
                                                    <td className={TD}>
                                                        <StatusBadge status={ticket.ticketStatus} />
                                                    </td>
                                                    <td className={TD}>
                                                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priority.className}`}>
                                                            {priority.label}
                                                        </span>
                                                    </td>
                                                    <td className={`${TD} text-right`}>
                                                        <Link
                                                            to={`/admin/tickets/${ticket.ticketId}`}
                                                            className={ACTION_VIEW}
                                                            title="Ver detalle"
                                                        >
                                                            <FaEye />
                                                        </Link>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
        </PageContainer>
    );
}

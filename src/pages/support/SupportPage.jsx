import { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext.jsx";
import { createTicket, getTickets } from "../../api/ticket.js";
import { createTicketDetail } from "../../api/ticketDetail.js";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
    FaPaperPlane,
    FaSpinner,
    FaHistory,
    FaCheckCircle,
    FaExclamationCircle,
    FaPlus,
    FaCloudUploadAlt,
    FaTimes,
    FaFileImage,
    FaSyncAlt,
    FaHeadset,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import InputFloatingComponent from "../../components/inputs/InputFloatingComponent.jsx";
import SelectFloatingComponent from "../../components/inputs/SelectFloatingComponent.jsx";
import TextareaFloatingComponent from "../../components/inputs/TextareaFloatingComponent.jsx";
import formatDate from "../../utils/formatDate.js";
import {
    PRIMARY_BTN_BLOCK,
    TABLE_WRAPPER,
    TABLE_TOOLBAR,
    THEAD,
    TH,
    TD,
    TD_MUTED,
    TBODY,
    TR_ROW,
    containerVariants,
    itemVariants,
    formatRecordCount,
} from "../../utils/expenseUiPatterns.js";

const TICKET_TYPE_OPTIONS = [
    { value: "SUPPORT", label: "Soporte Técnico" },
    { value: "SUGGESTION", label: "Sugerencia" },
    { value: "REQUEST", label: "Solicitud Comercial / Otro" },
];

const TICKET_TYPE_LABELS = {
    SUPPORT: "Soporte",
    SUGGESTION: "Sugerencia",
    REQUEST: "Solicitud",
};

function TicketStatusBadge({ status }) {
    const config = {
        CLOSED: {
            label: "Cerrado",
            className: "bg-slate-100 text-slate-600 border border-slate-200",
        },
        PENDING: {
            label: "Pendiente",
            className: "bg-amber-50 text-amber-700 border border-amber-200",
        },
        IN_PROGRESS: {
            label: "En progreso",
            className: "bg-secondary/10 text-secondary border border-secondary/20",
        },
        URGENT: {
            label: "Urgente",
            className: "bg-red-50 text-red-700 border border-red-200",
        },
        RESOLVED: {
            label: "Resuelto",
            className: "bg-slate-100 text-slate-600 border border-slate-200",
        },
    };

    const resolved =
        config[status] ?? {
            label: "Abierto",
            className: "bg-primary/10 text-primary border border-primary/20",
        };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${resolved.className}`}
        >
            {resolved.label}
        </span>
    );
}

function AssociationCheckbox({ checked, onChange, label }) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer group">
            <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    checked
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 bg-white group-hover:border-primary/40"
                }`}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only"
                />
                {checked && (
                    <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </span>
            <span className="text-sm text-slate-700">{label}</span>
        </label>
    );
}

export default function SupportPage() {
    const { user, business } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);

    const initialFormData = {
        subject: "",
        ticketType: "SUPPORT",
        description: "",
        ticketAssociatedTo: [],
    };
    const [formData, setFormData] = useState(initialFormData);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (user && business) {
            setFormData((prev) => ({
                ...prev,
                ticketAssociatedTo: [user.userId, business.businessId],
            }));
        }
        fetchTickets();
    }, [user, business]);

    const fetchTickets = async () => {
        try {
            setLoadingTickets(true);
            const res = await getTickets();
            setTickets(res.data || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFileToUpload(e.target.files[0]);
    };

    const handleRemoveFile = () => {
        setFileToUpload(null);
    };

    const toggleAssociation = (id) => {
        setFormData((prev) => {
            const current = prev.ticketAssociatedTo;
            if (current.includes(id)) {
                return { ...prev, ticketAssociatedTo: current.filter((item) => item !== id) };
            }
            return { ...prev, ticketAssociatedTo: [...current, id] };
        });
    };

    const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const uploadImage = async (ticketId) => {
        if (!fileToUpload) return null;

        const data = new FormData();
        data.append("file", fileToUpload);
        data.append("upload_preset", upload_preset);
        data.append("folder", "tickets_support");
        data.append("public_id", `ticket-${ticketId}`);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
                method: "POST",
                body: data,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || "Error subiendo imagen");
            return json.secure_url;
        } catch (error) {
            console.error("Cloudinary Error:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (formData.ticketAssociatedTo.length === 0) {
            setErrorMsg("Debes asociar el ticket al menos a tu usuario o negocio.");
            return;
        }
        if (!formData.description.trim() || !formData.subject.trim()) {
            setErrorMsg("Por favor completa el asunto y la descripción.");
            return;
        }

        setLoadingSubmit(true);

        try {
            const ticketRes = await createTicket({
                ticketAssociatedTo: formData.ticketAssociatedTo,
                ticketType: formData.ticketType,
                ticketSubject: formData.subject,
            });

            if (ticketRes.status !== 201) throw new Error("Error al iniciar el ticket.");
            const createdTicketId = ticketRes.data.ticketId;

            let imageUrl = null;
            if (fileToUpload) {
                try {
                    imageUrl = await uploadImage(createdTicketId);
                } catch (imgErr) {
                    console.warn("Fallo subida imagen", imgErr);
                }
            }

            const fullContent = `[ASUNTO: ${formData.subject}]\n\n${formData.description}`;

            const detailRes = await createTicketDetail({
                ticketId: createdTicketId,
                ticketAssociatedTo: formData.ticketAssociatedTo,
                ticketDetailContent: fullContent,
                ticketDetailImage: imageUrl ? [imageUrl] : [],
                ticketDetailOrigin: "CUSTOMER",
            });

            if (detailRes.status === 201) {
                setSuccessMsg("¡Ticket creado exitosamente! Nuestro equipo te contactará pronto.");
                setFormData((prev) => ({
                    ...initialFormData,
                    ticketAssociatedTo: prev.ticketAssociatedTo,
                }));
                setFileToUpload(null);
                fetchTickets();
            } else {
                throw new Error("Error al guardar el detalle del ticket.");
            }
        } catch (error) {
            console.error(error);
            setErrorMsg(error.message || "Ocurrió un error inesperado.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <PageContainer>
            <Motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Motion.div variants={itemVariants}>
                    <PageHeader
                        title="Soporte al Cliente"
                        subtitle="Crea tickets de ayuda y consulta el historial de solicitudes"
                    />
                </Motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Formulario — columna izquierda */}
                    <Motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col min-h-0">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="font-display text-lg font-bold text-dark flex items-center gap-2">
                                    <FaPlus className="text-primary text-base" />
                                    Nuevo Ticket
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Describe tu problema y te ayudaremos lo antes posible.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 space-y-4">
                                <SelectFloatingComponent
                                    label="Tipo de Solicitud"
                                    name="ticketType"
                                    value={formData.ticketType}
                                    onChange={handleOnChange}
                                    options={TICKET_TYPE_OPTIONS}
                                    className="!mb-0"
                                />

                                <InputFloatingComponent
                                    label="Asunto"
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleOnChange}
                                />

                                <TextareaFloatingComponent
                                    label="Detalle"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleOnChange}
                                    rows={4}
                                />

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                                        Adjuntar imagen (opcional)
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {!fileToUpload ? (
                                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200 border-dashed text-sm">
                                                <FaCloudUploadAlt className="text-primary" />
                                                <span>Seleccionar archivo</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                                <FaFileImage />
                                                <span className="truncate max-w-[180px]">{fileToUpload.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFile}
                                                    className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                                                    aria-label="Quitar archivo"
                                                >
                                                    <FaTimes className="text-xs" />
                                                </button>
                                            </div>
                                        )}
                                        <span className="text-[11px] text-slate-400">PNG, JPG hasta 5MB</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                        Asociar a
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <AssociationCheckbox
                                            checked={formData.ticketAssociatedTo.includes(user?.userId)}
                                            onChange={() => toggleAssociation(user?.userId)}
                                            label={`Mi Usuario (${user?.userFirstName ?? "—"})`}
                                        />
                                        {business && (
                                            <AssociationCheckbox
                                                checked={formData.ticketAssociatedTo.includes(
                                                    business?.businessId,
                                                )}
                                                onChange={() => toggleAssociation(business?.businessId)}
                                                label={`Mi Negocio (${business?.businessName})`}
                                            />
                                        )}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {errorMsg && (
                                        <Motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100"
                                        >
                                            <FaExclamationCircle className="mt-0.5 shrink-0" />
                                            {errorMsg}
                                        </Motion.div>
                                    )}
                                    {successMsg && (
                                        <Motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-primary/10 text-primary p-3 rounded-lg text-sm flex items-start gap-2 border border-primary/20"
                                        >
                                            <FaCheckCircle className="mt-0.5 shrink-0" />
                                            {successMsg}
                                        </Motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-auto pt-1">
                                    <button
                                        type="submit"
                                        disabled={loadingSubmit}
                                        className={`${PRIMARY_BTN_BLOCK} disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary`}
                                    >
                                        {loadingSubmit ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Creando ticket…
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                Enviar ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Motion.div>

                    {/* Historial — columna derecha */}
                    <Motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col min-h-0">
                        <div className={`${TABLE_WRAPPER} flex flex-col h-full`}>
                            <div className={TABLE_TOOLBAR}>
                                <div>
                                    <h2 className="font-display text-lg font-bold text-dark flex items-center gap-2">
                                        <FaHistory className="text-slate-400 text-base" />
                                        Historial de Tickets
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {formatRecordCount(tickets.length, loadingTickets)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={fetchTickets}
                                    disabled={loadingTickets}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary hover:text-secondary-hover hover:bg-secondary/5 rounded-lg transition-colors border border-transparent hover:border-secondary/15 disabled:opacity-50"
                                >
                                    <FaSyncAlt className={loadingTickets ? "animate-spin" : ""} />
                                    Actualizar
                                </button>
                            </div>

                            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[320px] custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className={`${THEAD} sticky top-0 z-10`}>
                                        <tr>
                                            <th className={TH}>Ticket #</th>
                                            <th className={TH}>Estado</th>
                                            <th className={TH}>Tipo</th>
                                            <th className={`${TH} text-right`}>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody className={TBODY}>
                                        <AnimatePresence mode="wait">
                                            {loadingTickets ? (
                                                <tr key="loading">
                                                    <td colSpan={4} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-3">
                                                            <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
                                                            <p className="text-slate-500 text-sm">
                                                                Cargando tickets…
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : tickets.length === 0 ? (
                                                <tr key="empty">
                                                    <td colSpan={4} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                                                            <FaHeadset className="text-4xl text-slate-300" />
                                                            <p className="text-sm font-medium">
                                                                No has creado ningún ticket aún.
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                Usa el formulario para contactar a soporte.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                tickets.map((ticket) => (
                                                    <Motion.tr
                                                        key={ticket.ticketId || ticket.id}
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className={TR_ROW}
                                                    >
                                                        <td className={TD}>
                                                            <span className="font-mono font-semibold text-dark text-sm">
                                                                {ticket.ticketNumber ||
                                                                    ticket.ticketId?.slice(0, 8)}
                                                            </span>
                                                            {ticket.ticketSubject && (
                                                                <p className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5">
                                                                    {ticket.ticketSubject}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className={TD}>
                                                            <TicketStatusBadge status={ticket.ticketStatus} />
                                                        </td>
                                                        <td className={`${TD_MUTED} whitespace-nowrap`}>
                                                            {TICKET_TYPE_LABELS[ticket.ticketType] ??
                                                                ticket.ticketType ??
                                                                "—"}
                                                        </td>
                                                        <td className={`${TD_MUTED} text-right whitespace-nowrap`}>
                                                            {formatDate(ticket.createdAt || Date.now())}
                                                        </td>
                                                    </Motion.tr>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Motion.div>
                </div>
            </Motion.div>
        </PageContainer>
    );
}

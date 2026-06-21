import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    FaRobot,
    FaPlus,
    FaCopy,
    FaTrash,
    FaPlay,
    FaCheck,
    FaBan,
    FaShieldAlt,
    FaClipboardList,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import {
    createAgentTaskRequest,
    deleteAgentTaskRequest,
    getAgentTasksRequest,
    updateAgentTaskStatusRequest,
} from "../../api/agentTasks.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

const STATUS_STYLES = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    IN_PROGRESS: "bg-blue-50 text-blue-800 border-blue-200",
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
    BLOCKED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En progreso",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    BLOCKED: "Bloqueada",
};

const PRIORITY_LABELS = {
    LOW: "Baja",
    NORMAL: "Normal",
    HIGH: "Alta",
};

function formatWhen(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function AgentTasksAdminPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [cursorPrompt, setCursorPrompt] = useState("");
    const [safetyRules, setSafetyRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState("ALL");
    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "NORMAL",
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAgentTasksRequest();
            setTasks(res.data?.tasks ?? []);
            setStats(res.data?.stats ?? null);
            setCursorPrompt(res.data?.cursorPrompt ?? "");
            setSafetyRules(res.data?.safetyRules ?? []);
        } catch {
            toast.error("Error", "No se pudieron cargar las tareas del agente.");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        load();
    }, [load]);

    const filteredTasks = useMemo(() => {
        if (filter === "ALL") return tasks;
        return tasks.filter((t) => t.status === filter);
    }, [tasks, filter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createAgentTaskRequest(form);
            if (res.data?.blocked) {
                toast.warning(
                    "Tarea bloqueada",
                    res.data.message ?? "Contenido no permitido por seguridad.",
                );
            } else {
                toast.success("Tarea agregada", "Quedó en cola para ejecutar con Cursor.");
            }
            setForm({ title: "", description: "", priority: "NORMAL" });
            await load();
        } catch (err) {
            toast.error("Error", err.response?.data?.message ?? "No se pudo crear la tarea.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(cursorPrompt);
            toast.success("Copiado", "Pega esto en Cursor para ejecutar las tareas pendientes.");
        } catch {
            toast.error("Error", "No se pudo copiar al portapapeles.");
        }
    };

    const handleStatus = async (taskId, status) => {
        try {
            await updateAgentTaskStatusRequest(taskId, { status });
            await load();
        } catch (err) {
            toast.error("Error", err.response?.data?.message ?? "No se pudo actualizar.");
        }
    };

    const handleDelete = async (task) => {
        const ok = await confirm({
            title: "Eliminar tarea",
            message: `¿Eliminar "${task.title}"?`,
            confirmLabel: "Eliminar",
        });
        if (!ok) return;
        try {
            await deleteAgentTaskRequest(task.taskId);
            toast.success("Eliminada", "La tarea fue eliminada.");
            await load();
        } catch {
            toast.error("Error", "No se pudo eliminar la tarea.");
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Tareas del agente"
                subtitle="Agrega tareas desde el móvil; en la PC pídele a Cursor que las ejecute."
                actions={
                    <button
                        type="button"
                        onClick={handleCopyPrompt}
                        disabled={!cursorPrompt || cursorPrompt.includes("No hay tareas")}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
                    >
                        <FaCopy />
                        Copiar prompt para Cursor
                    </button>
                }
            />

            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    {[
                        ["Pendientes", stats.pending, "text-amber-700"],
                        ["En progreso", stats.inProgress, "text-blue-700"],
                        ["Completadas", stats.completed, "text-emerald-700"],
                        ["Bloqueadas", stats.blocked, "text-red-700"],
                        ["Canceladas", stats.cancelled, "text-slate-600"],
                    ].map(([label, value, color]) => (
                        <div
                            key={label}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                        >
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.form
                    onSubmit={handleSubmit}
                    className="lg:col-span-1 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-fit"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 text-dark font-semibold">
                        <FaPlus className="text-primary" />
                        Nueva tarea
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Título
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Ej: Agregar filtro por fecha en reportes"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                            maxLength={200}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, description: e.target.value }))
                            }
                            placeholder="Detalla qué debe hacer el agente: archivos, comportamiento esperado, etc."
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm min-h-[120px]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Prioridad
                        </label>
                        <select
                            value={form.priority}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, priority: e.target.value }))
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                        >
                            <option value="LOW">Baja</option>
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">Alta</option>
                        </select>
                    </div>

                    <button type="submit" disabled={submitting} className={`${PRIMARY_BTN} w-full justify-center`}>
                        {submitting ? "Guardando…" : "Agregar a la cola"}
                    </button>

                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                            <FaShieldAlt className="text-amber-600" />
                            Reglas de seguridad
                        </p>
                        <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                            {safetyRules.map((rule) => (
                                <li key={rule}>{rule}</li>
                            ))}
                        </ul>
                    </div>
                </motion.form>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {[
                            ["ALL", "Todas"],
                            ["PENDING", "Pendientes"],
                            ["IN_PROGRESS", "En progreso"],
                            ["COMPLETED", "Completadas"],
                            ["BLOCKED", "Bloqueadas"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFilter(value)}
                                className={
                                    filter === value
                                        ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                                        : "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p className="text-sm text-slate-500">Cargando tareas…</p>
                    ) : filteredTasks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
                            <FaClipboardList className="mx-auto text-3xl text-slate-300 mb-3" />
                            <p className="text-slate-600 font-medium">Sin tareas en esta vista</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Agrega una desde el formulario o cambia el filtro.
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {filteredTasks.map((task) => (
                                <li
                                    key={task.taskId}
                                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-dark">
                                                    {task.title}
                                                </h3>
                                                <span
                                                    className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[task.status] ?? STATUS_STYLES.PENDING}`}
                                                >
                                                    {STATUS_LABELS[task.status] ?? task.status}
                                                </span>
                                                {task.priority !== "NORMAL" && (
                                                    <span className="text-[10px] font-semibold text-slate-500">
                                                        {PRIORITY_LABELS[task.priority]}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                                                {task.description}
                                            </p>
                                            {task.safetyReason && (
                                                <p className="text-xs text-red-600 mt-2 flex items-start gap-1">
                                                    <FaBan className="shrink-0 mt-0.5" />
                                                    {task.safetyReason}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-400 mt-2">
                                                Creada {formatWhen(task.createdAt)}
                                                {task.executedAt &&
                                                    ` · Completada ${formatWhen(task.executedAt)}`}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 shrink-0">
                                            {task.status === "PENDING" &&
                                                task.safetyStatus === "APPROVED" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        title="Marcar en progreso"
                                                        onClick={() =>
                                                            handleStatus(task.taskId, "IN_PROGRESS")
                                                        }
                                                        className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <FaPlay className="text-xs" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Marcar completada"
                                                        onClick={() =>
                                                            handleStatus(task.taskId, "COMPLETED")
                                                        }
                                                        className="p-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                    >
                                                        <FaCheck className="text-xs" />
                                                    </button>
                                                </>
                                            )}
                                            {task.status === "IN_PROGRESS" && (
                                                <button
                                                    type="button"
                                                    title="Marcar completada"
                                                    onClick={() =>
                                                        handleStatus(task.taskId, "COMPLETED")
                                                    }
                                                    className="p-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                >
                                                    <FaCheck className="text-xs" />
                                                </button>
                                            )}
                                            {["PENDING", "IN_PROGRESS"].includes(task.status) && (
                                                <button
                                                    type="button"
                                                    title="Cancelar"
                                                    onClick={() =>
                                                        handleStatus(task.taskId, "CANCELLED")
                                                    }
                                                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                                                >
                                                    <FaBan className="text-xs" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                title="Eliminar"
                                                onClick={() => handleDelete(task)}
                                                className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                        <p className="text-sm font-semibold text-dark flex items-center gap-2 mb-2">
                            <FaRobot className="text-secondary" />
                            Cómo usar con Cursor
                        </p>
                        <ol className="text-sm text-slate-600 space-y-1 list-decimal pl-4">
                            <li>Desde el teléfono, agrega tareas aquí cuando se te ocurran.</li>
                            <li>En la PC, pulsa «Copiar prompt para Cursor» y pégalo en el chat.</li>
                            <li>Marca cada tarea como completada cuando el agente termine.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

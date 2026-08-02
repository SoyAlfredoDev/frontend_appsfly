import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaCheck,
    FaCopy,
    FaLink,
    FaPhoneAlt,
    FaTimes,
    FaWhatsapp,
    FaCalendarAlt,
} from "react-icons/fa";
import ExpensePageLayout, {
    ExpenseAnimatedSection,
} from "../../components/ui/ExpensePageLayout.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import {
    getAppointmentSettings,
    getAppointments,
    getTenantAppointmentSlots,
    patchAppointment,
    updateAppointmentSettings,
} from "../../api/appointments.js";
import { buildWhatsAppUrl, formatProviderPhone } from "../../utils/providerContact.js";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

const DAY_LABELS = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
];

const STATUS_LABELS = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    COMPLETED: "Atendida",
    RESCHEDULED: "Reagendada",
};

const STATUS_STYLES = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    CONFIRMED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
    COMPLETED: "bg-sky-50 text-sky-800 border-sky-200",
    RESCHEDULED: "bg-violet-50 text-violet-800 border-violet-200",
};

const DEFAULT_SETTINGS = {
    appointmentsEnabled: false,
    slotDurationMinutes: 30,
    maxDaysAhead: 30,
    visitorMessage: "",
    weeklyAvailability: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 1, startTime: "15:00", endTime: "18:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 2, startTime: "15:00", endTime: "18:00" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 3, startTime: "15:00", endTime: "18:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 4, startTime: "15:00", endTime: "18:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 5, startTime: "15:00", endTime: "18:00" },
    ],
    publicLink: "",
};

function formatWhen(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-CL", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AppointmentsPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [tab, setTab] = useState("inbox");
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [appointments, setAppointments] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ACTIVE");
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [loadingList, setLoadingList] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rescheduleId, setRescheduleId] = useState(null);
    const [rescheduleSlots, setRescheduleSlots] = useState([]);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    const loadSettings = useCallback(async () => {
        setLoadingSettings(true);
        try {
            const res = await getAppointmentSettings();
            const data = res.data.settings || {};
            setSettings({
                ...DEFAULT_SETTINGS,
                ...data,
                visitorMessage: data.visitorMessage || "",
                weeklyAvailability:
                    data.weeklyAvailability?.length
                        ? data.weeklyAvailability
                        : DEFAULT_SETTINGS.weeklyAvailability,
            });
        } catch {
            toast.error("Error", "No se pudo cargar la configuración de citas.");
        } finally {
            setLoadingSettings(false);
        }
    }, [toast]);

    const loadAppointments = useCallback(async () => {
        setLoadingList(true);
        try {
            const res = await getAppointments({ status: statusFilter });
            setAppointments(res.data.appointments || []);
        } catch {
            toast.error("Error", "No se pudieron cargar las citas.");
        } finally {
            setLoadingList(false);
        }
    }, [statusFilter, toast]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const copyLink = async () => {
        if (!settings.publicLink) return;
        try {
            await navigator.clipboard.writeText(settings.publicLink);
            toast.success("Copiado", "Link de agendamiento copiado al portapapeles.");
        } catch {
            toast.error("Error", "No se pudo copiar el link.");
        }
    };

    const saveSettings = async () => {
        if (!settings.weeklyAvailability.length && settings.appointmentsEnabled) {
            toast.error("Horarios", "Agrega al menos una franja horaria para habilitar citas.");
            return;
        }
        setSaving(true);
        try {
            const res = await updateAppointmentSettings({
                appointmentsEnabled: settings.appointmentsEnabled,
                slotDurationMinutes: Number(settings.slotDurationMinutes),
                maxDaysAhead: Number(settings.maxDaysAhead),
                visitorMessage: settings.visitorMessage || null,
                weeklyAvailability: settings.weeklyAvailability.map((row) => ({
                    dayOfWeek: Number(row.dayOfWeek),
                    startTime: row.startTime,
                    endTime: row.endTime,
                })),
            });
            setSettings((prev) => ({
                ...prev,
                ...res.data.settings,
                visitorMessage: res.data.settings.visitorMessage || "",
            }));
            toast.success("Guardado", "Configuración de citas actualizada.");
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo guardar la configuración.",
            );
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (appointment, status) => {
        const labels = {
            CONFIRMED: "confirmar",
            CANCELLED: "cancelar",
            COMPLETED: "marcar como atendida",
        };
        const ok = await confirm({
            title: "Actualizar cita",
            message: `¿Deseas ${labels[status] || "actualizar"} la cita de ${appointment.firstName} ${appointment.lastName}?`,
            confirmText: "Sí",
            cancelText: "No",
        });
        if (!ok) return;
        try {
            await patchAppointment(appointment.appointmentId, { status });
            toast.success("Actualizado", "Estado de la cita actualizado.");
            loadAppointments();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo actualizar la cita.",
            );
        }
    };

    const openReschedule = async (appointment) => {
        setRescheduleId(appointment.appointmentId);
        setRescheduleLoading(true);
        setRescheduleSlots([]);
        try {
            const res = await getTenantAppointmentSlots({
                excludeAppointmentId: appointment.appointmentId,
            });
            setRescheduleSlots(res.data.slots || []);
        } catch {
            toast.error("Error", "No se pudieron cargar horarios libres.");
            setRescheduleId(null);
        } finally {
            setRescheduleLoading(false);
        }
    };

    const applyReschedule = async (startsAt) => {
        if (!rescheduleId) return;
        try {
            await patchAppointment(rescheduleId, { startsAt });
            toast.success("Reagendada", "La cita fue movida al nuevo horario.");
            setRescheduleId(null);
            loadAppointments();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo reagendar.",
            );
        }
    };

    const addAvailabilityRow = () => {
        setSettings((prev) => ({
            ...prev,
            weeklyAvailability: [
                ...prev.weeklyAvailability,
                { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
            ],
        }));
    };

    const updateAvailabilityRow = (index, field, value) => {
        setSettings((prev) => {
            const next = [...prev.weeklyAvailability];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, weeklyAvailability: next };
        });
    };

    const removeAvailabilityRow = (index) => {
        setSettings((prev) => ({
            ...prev,
            weeklyAvailability: prev.weeklyAvailability.filter((_, i) => i !== index),
        }));
    };

    const tabs = useMemo(
        () => [
            { id: "inbox", label: "Citas" },
            { id: "settings", label: "Configuración" },
        ],
        [],
    );

    return (
        <ExpensePageLayout
            title="Citas"
            subtitle="Habilita el link público, define horarios y gestiona solicitudes."
            actions={
                settings.publicLink ? (
                    <button type="button" onClick={copyLink} className={PRIMARY_BTN}>
                        <FaCopy className="text-sm" />
                        Copiar link
                    </button>
                ) : null
            }
        >
            <ExpenseAnimatedSection>
                <div className="flex gap-2 border-b border-slate-200 mb-6">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
                            className={
                                tab === item.id
                                    ? "px-4 py-2 text-sm font-semibold text-emerald-700 border-b-2 border-emerald-600"
                                    : "px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                            }
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </ExpenseAnimatedSection>

            {tab === "settings" ? (
                <ExpenseAnimatedSection className="space-y-6">
                    {loadingSettings ? (
                        <p className="text-sm text-slate-500">Cargando configuración…</p>
                    ) : (
                        <>
                            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Habilitar citas
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Solo funciona si tu plan (gratuito o pago) está activo.
                                        </p>
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={settings.appointmentsEnabled}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    appointmentsEnabled: e.target.checked,
                                                }))
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                        />
                                        Activo
                                    </label>
                                </div>

                                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-3">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                        <FaLink />
                                        Link público
                                    </div>
                                    <p className="text-sm text-slate-800 break-all">
                                        {settings.publicLink || "—"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="text-sm block">
                                        <span className="font-medium text-slate-700">
                                            Duración del slot (min)
                                        </span>
                                        <input
                                            type="number"
                                            min={10}
                                            max={240}
                                            value={settings.slotDurationMinutes}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    slotDurationMinutes: e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                        />
                                    </label>
                                    <label className="text-sm block">
                                        <span className="font-medium text-slate-700">
                                            Días hacia adelante
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={90}
                                            value={settings.maxDaysAhead}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    maxDaysAhead: e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                        />
                                    </label>
                                </div>

                                <label className="text-sm block">
                                    <span className="font-medium text-slate-700">
                                        Mensaje para visitantes (opcional)
                                    </span>
                                    <textarea
                                        rows={2}
                                        value={settings.visitorMessage}
                                        onChange={(e) =>
                                            setSettings((prev) => ({
                                                ...prev,
                                                visitorMessage: e.target.value,
                                            }))
                                        }
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                        maxLength={500}
                                    />
                                </label>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Horarios semanales
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addAvailabilityRow}
                                        className="text-sm font-medium text-emerald-700 hover:underline"
                                    >
                                        + Agregar franja
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Día: 0 = domingo … 6 = sábado. Horas en formato 24h (HH:mm).
                                </p>
                                <div className="space-y-3">
                                    {settings.weeklyAvailability.map((row, index) => (
                                        <div
                                            key={`${row.dayOfWeek}-${row.startTime}-${index}`}
                                            className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr_auto] gap-2 items-end"
                                        >
                                            <label className="text-sm block">
                                                <span className="text-slate-600">Día</span>
                                                <select
                                                    value={row.dayOfWeek}
                                                    onChange={(e) =>
                                                        updateAvailabilityRow(
                                                            index,
                                                            "dayOfWeek",
                                                            Number(e.target.value),
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                                >
                                                    {DAY_LABELS.map((label, day) => (
                                                        <option key={label} value={day}>
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="text-sm block">
                                                <span className="text-slate-600">Desde</span>
                                                <input
                                                    type="time"
                                                    value={row.startTime}
                                                    onChange={(e) =>
                                                        updateAvailabilityRow(
                                                            index,
                                                            "startTime",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                                />
                                            </label>
                                            <label className="text-sm block">
                                                <span className="text-slate-600">Hasta</span>
                                                <input
                                                    type="time"
                                                    value={row.endTime}
                                                    onChange={(e) =>
                                                        updateAvailabilityRow(
                                                            index,
                                                            "endTime",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removeAvailabilityRow(index)}
                                                className="h-10 w-10 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 flex items-center justify-center"
                                                aria-label="Eliminar franja"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                    {!settings.weeklyAvailability.length ? (
                                        <p className="text-sm text-amber-700">
                                            Sin franjas: los visitantes no verán horarios.
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={saveSettings}
                                disabled={saving}
                                className={PRIMARY_BTN}
                            >
                                {saving ? "Guardando…" : "Guardar configuración"}
                            </button>
                        </>
                    )}
                </ExpenseAnimatedSection>
            ) : (
                <ExpenseAnimatedSection className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm text-slate-600 flex items-center gap-2">
                            Estado
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            >
                                <option value="ACTIVE">Pendientes y confirmadas</option>
                                <option value="PENDING">Pendientes</option>
                                <option value="CONFIRMED">Confirmadas</option>
                                <option value="COMPLETED">Atendidas</option>
                                <option value="CANCELLED">Canceladas</option>
                                <option value="RESCHEDULED">Reagendadas</option>
                            </select>
                        </label>
                    </div>

                    {loadingList ? (
                        <p className="text-sm text-slate-500">Cargando citas…</p>
                    ) : appointments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                            <FaCalendarAlt className="mx-auto text-slate-300 text-3xl mb-3" />
                            <p className="text-sm text-slate-600">No hay citas en este filtro.</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Comparte tu link público para empezar a recibir solicitudes.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map((appt) => {
                                const wa = buildWhatsAppUrl(appt.phoneCode, appt.phoneNumber);
                                const phoneLabel = formatProviderPhone(
                                    appt.phoneCode,
                                    appt.phoneNumber,
                                );
                                return (
                                    <div
                                        key={appt.appointmentId}
                                        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-900">
                                                    {appt.firstName} {appt.lastName}
                                                </h3>
                                                <p className="text-sm text-slate-600 mt-0.5 capitalize">
                                                    {formatWhen(appt.startsAt)}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                    <FaPhoneAlt className="text-xs" />
                                                    {phoneLabel}
                                                </p>
                                                {appt.notes ? (
                                                    <p className="text-sm text-slate-600 mt-2">
                                                        {appt.notes}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[appt.status] || STATUS_STYLES.PENDING}`}
                                            >
                                                {STATUS_LABELS[appt.status] || appt.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {wa ? (
                                                <a
                                                    href={wa}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-medium no-underline hover:bg-emerald-700"
                                                >
                                                    <FaWhatsapp />
                                                    Contactar
                                                </a>
                                            ) : null}
                                            {appt.status === "PENDING" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => updateStatus(appt, "CONFIRMED")}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm font-medium"
                                                >
                                                    <FaCheck />
                                                    Aceptar
                                                </button>
                                            ) : null}
                                            {["PENDING", "CONFIRMED", "RESCHEDULED"].includes(
                                                appt.status,
                                            ) ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openReschedule(appt)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 px-3 py-2 text-sm font-medium"
                                                    >
                                                        Modificar horario
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateStatus(appt, "COMPLETED")}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 text-sky-800 px-3 py-2 text-sm font-medium"
                                                    >
                                                        Atendida
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateStatus(appt, "CANCELLED")}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm font-medium"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>

                                        {rescheduleId === appt.appointmentId ? (
                                            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        Elegir nuevo horario
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRescheduleId(null)}
                                                        className="text-xs text-slate-500 hover:text-slate-800"
                                                    >
                                                        Cerrar
                                                    </button>
                                                </div>
                                                {rescheduleLoading ? (
                                                    <p className="text-sm text-slate-500">Cargando…</p>
                                                ) : rescheduleSlots.length === 0 ? (
                                                    <p className="text-sm text-amber-700">
                                                        No hay horarios libres.
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                                        {rescheduleSlots.slice(0, 40).map((slot) => (
                                                            <button
                                                                key={slot.startsAt}
                                                                type="button"
                                                                onClick={() =>
                                                                    applyReschedule(slot.startsAt)
                                                                }
                                                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 hover:border-emerald-500"
                                                            >
                                                                {formatWhen(slot.startsAt)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ExpenseAnimatedSection>
            )}
        </ExpensePageLayout>
    );
}

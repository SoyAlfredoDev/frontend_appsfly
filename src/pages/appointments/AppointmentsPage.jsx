import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppointmentBrandingSettings, {
    parseOptionalCoordinate,
    uploadAppointmentGalleryImages,
} from "./AppointmentBrandingSettings.tsx";
import {
    FaCheck,
    FaCopy,
    FaLink,
    FaExternalLinkAlt,
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
import { useAuth } from "../../context/authContext.jsx";
import { hasAppointmentsPlan } from "../../utils/appointmentPlanAccess.ts";
import AppointmentsPlanNotice from "./AppointmentsPlanNotice.tsx";
import AppointmentSetupChecklist from "./AppointmentSetupChecklist.tsx";
import { appointmentDay, formatAppointmentTime, groupActiveAppointments } from "./appointmentInbox.ts";
import { resolveBusinessTimezone } from "../../utils/businessTime.js";
import {
    getAppointmentSettings,
    getAppointments,
    getTenantAppointmentSlots,
    patchAppointment,
    updateAppointmentSettings,
} from "../../api/appointments.js";
import { buildWhatsAppUrl, formatProviderPhone } from "../../utils/providerContact.js";
const PRIMARY_BUTTON = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50";

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
    maxConcurrentPerSlot: 1,
    maxDaysAhead: 30,
    customerNotificationsEnabled: false,
    visitorMessage: "",
    galleryImageUrls: [],
    locationAddress: "",
    locationLatitude: "",
    locationLongitude: "",
    weeklyAvailability: [],
    publicLink: "",
};

const WEEKDAY_TEMPLATE = [1, 2, 3, 4, 5].flatMap((dayOfWeek) => [
    { dayOfWeek, startTime: "09:00", endTime: "13:00" },
    { dayOfWeek, startTime: "15:00", endTime: "18:00" },
]);

export default function AppointmentsPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const { subscriptions, loadingAuth, activeBusinessId, business } = useAuth();
    const appointmentsAllowed = hasAppointmentsPlan(subscriptions);
    const [planBlocked, setPlanBlocked] = useState(false);
    const [tab, setTab] = useState("inbox");
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [savedActivation, setSavedActivation] = useState({ enabled: false, hasAvailability: false });
    const [settingsError, setSettingsError] = useState(false);
    const [listError, setListError] = useState(false);
    const timezone = resolveBusinessTimezone(settings.timezone || business);
    const [appointments, setAppointments] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ACTIVE");
    const [loadingSettings, setLoadingSettings] = useState(true);
    const shareReady = !loadingSettings && !settingsError && savedActivation.enabled
        && savedActivation.hasAvailability && Boolean(settings.publicLink);
    const [loadingList, setLoadingList] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rescheduleId, setRescheduleId] = useState(null);
    const [rescheduleSlots, setRescheduleSlots] = useState([]);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [rescheduleError, setRescheduleError] = useState("");
    const [selectedReplacement, setSelectedReplacement] = useState("");
    const [rescheduleSaving, setRescheduleSaving] = useState(false);
    const slotRequest = useRef(0);
    const listRequest = useRef(0);
    const settingsRequest = useRef(0);
    const [pendingGalleryUploads, setPendingGalleryUploads] = useState([]);

    const loadSettings = useCallback(async () => {
        const request = ++settingsRequest.current;
        setLoadingSettings(true);
        setSettingsError(false);
        try {
            const res = await getAppointmentSettings();
            if (request !== settingsRequest.current) return;
            setPlanBlocked(false);
            const data = res.data.settings || {};
            setSavedActivation({
                enabled: Boolean(data.appointmentsEnabled),
                hasAvailability: Boolean(data.weeklyAvailability?.length),
            });
            setSettings({
                ...DEFAULT_SETTINGS,
                ...data,
                visitorMessage: data.visitorMessage || "",
                maxConcurrentPerSlot: data.maxConcurrentPerSlot || 1,
                customerNotificationsEnabled: Boolean(data.customerNotificationsEnabled),
                galleryImageUrls: Array.isArray(data.galleryImageUrls)
                    ? data.galleryImageUrls
                    : [],
                locationAddress: data.locationAddress || "",
                locationLatitude:
                    data.locationLatitude == null ? "" : String(data.locationLatitude),
                locationLongitude:
                    data.locationLongitude == null ? "" : String(data.locationLongitude),
                weeklyAvailability: Array.isArray(data.weeklyAvailability)
                    ? data.weeklyAvailability
                    : [],
            });
            setPendingGalleryUploads([]);
        } catch (error) {
            if (request !== settingsRequest.current) return;
            if (error.response?.data?.code === "APPOINTMENTS_PLAN_REQUIRED") {
                setPlanBlocked(true);
                return;
            }
            setSettingsError(true);
        } finally {
            if (request === settingsRequest.current) setLoadingSettings(false);
        }
    }, []);

    const loadAppointments = useCallback(async () => {
        const request = ++listRequest.current;
        setLoadingList(true);
        setListError(false);
        try {
            const res = await getAppointments({ status: statusFilter });
            if (request === listRequest.current) setAppointments(res.data.appointments || []);
        } catch {
            if (request === listRequest.current) setListError(true);
        } finally {
            if (request === listRequest.current) setLoadingList(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        if (loadingAuth || !appointmentsAllowed) return;
        loadSettings();
    }, [loadSettings, loadingAuth, appointmentsAllowed, activeBusinessId]);

    useEffect(() => {
        if (loadingAuth || !appointmentsAllowed) return;
        loadAppointments();
    }, [loadAppointments, loadingAuth, appointmentsAllowed, activeBusinessId]);

    const copyLink = async () => {
        if (!shareReady) return;
        try {
            await navigator.clipboard.writeText(settings.publicLink);
            toast.success("Copiado", "Enlace de agendamiento copiado al portapapeles.");
        } catch {
            toast.error("Error", "No se pudo copiar. Puedes seleccionar el enlace en Configuración.");
        }
    };

    const saveSettings = async () => {
        if (!settings.weeklyAvailability.length && settings.appointmentsEnabled) {
            toast.error("Horarios", "Agrega al menos una franja horaria para habilitar citas.");
            return;
        }
        setSaving(true);
        try {
            let galleryImageUrls = settings.galleryImageUrls || [];
            if (pendingGalleryUploads.length) {
                if (!activeBusinessId) {
                    toast.error("Error", "No se pudo identificar el negocio para subir fotos.");
                    return;
                }
                galleryImageUrls = await uploadAppointmentGalleryImages(
                    activeBusinessId,
                    galleryImageUrls,
                    pendingGalleryUploads,
                );
            }

            const res = await updateAppointmentSettings({
                appointmentsEnabled: settings.appointmentsEnabled,
                slotDurationMinutes: Number(settings.slotDurationMinutes),
                maxConcurrentPerSlot: Number(settings.maxConcurrentPerSlot),
                maxDaysAhead: Number(settings.maxDaysAhead),
                customerNotificationsEnabled: Boolean(settings.customerNotificationsEnabled),
                visitorMessage: settings.visitorMessage || null,
                galleryImageUrls,
                locationAddress: settings.locationAddress.trim() || null,
                locationLatitude: parseOptionalCoordinate(settings.locationLatitude),
                locationLongitude: parseOptionalCoordinate(settings.locationLongitude),
                weeklyAvailability: settings.weeklyAvailability.map((row) => ({
                    dayOfWeek: Number(row.dayOfWeek),
                    startTime: row.startTime,
                    endTime: row.endTime,
                })),
            });
            setSavedActivation({
                enabled: Boolean(res.data.settings.appointmentsEnabled),
                hasAvailability: Boolean(res.data.settings.weeklyAvailability?.length),
            });
            setSettings((prev) => ({
                ...prev,
                ...res.data.settings,
                visitorMessage: res.data.settings.visitorMessage || "",
                galleryImageUrls: res.data.settings.galleryImageUrls || [],
                locationAddress: res.data.settings.locationAddress || "",
                locationLatitude:
                    res.data.settings.locationLatitude == null
                        ? ""
                        : String(res.data.settings.locationLatitude),
                locationLongitude:
                    res.data.settings.locationLongitude == null
                        ? ""
                        : String(res.data.settings.locationLongitude),
            }));
            setPendingGalleryUploads([]);
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

    const closeReschedule = () => {
        slotRequest.current += 1;
        setRescheduleId(null);
        setRescheduleError("");
        setSelectedReplacement("");
    };

    const openReschedule = async (appointment) => {
        const request = ++slotRequest.current;
        setRescheduleId(appointment.appointmentId);
        setRescheduleLoading(true);
        setRescheduleError("");
        setSelectedReplacement("");
        setRescheduleSlots([]);
        try {
            const res = await getTenantAppointmentSlots({
                excludeAppointmentId: appointment.appointmentId,
            });
            if (request !== slotRequest.current) return;
            setRescheduleSlots((res.data.slots || []).filter(
                (slot) => Date.parse(slot.startsAt) !== Date.parse(appointment.startsAt),
            ));
        } catch {
            if (request === slotRequest.current) setRescheduleError("No se pudieron cargar los horarios.");
        } finally {
            if (request === slotRequest.current) setRescheduleLoading(false);
        }
    };

    const applyReschedule = async (appointment) => {
        if (!selectedReplacement || rescheduleSaving) return;
        setRescheduleSaving(true);
        try {
            const ok = await confirm({
                title: "Confirmar cambio de horario",
                message: `Cambiar la cita de ${appointment.firstName} ${appointment.lastName} del ${formatAppointmentTime(appointment.startsAt, timezone)} al ${formatAppointmentTime(selectedReplacement, timezone)}.`,
                confirmText: "Reagendar cita",
                cancelText: "Volver",
                variant: "info",
            });
            if (!ok) return;
            await patchAppointment(appointment.appointmentId, { startsAt: selectedReplacement });
            toast.success("Reagendada", "La cita fue movida al nuevo horario.");
            closeReschedule();
            loadAppointments();
        } catch (error) {
            if (error.response?.status === 409) {
                await openReschedule(appointment);
                toast.error("Horario ocupado", "Selecciona otro horario disponible.");
            } else {
                toast.error(
                    "Error",
                    error.response?.data?.message || "No se pudo reagendar.",
                );
            }
        } finally {
            setRescheduleSaving(false);
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

    const applyWeekdayTemplate = () => {
        setSettings((prev) => ({
            ...prev,
            weeklyAvailability: WEEKDAY_TEMPLATE.map((row) => ({ ...row })),
        }));
    };

    const tabs = useMemo(
        () => [
            { id: "inbox", label: "Citas" },
            { id: "settings", label: "Configuración" },
        ],
        [],
    );

    const appointmentGroups = statusFilter === "ACTIVE"
        ? groupActiveAppointments(appointments, timezone)
        : [{ id: "filtered", label: "", appointments }];
    const today = appointmentDay(new Date(), timezone);
    const setupChecklist = (onConfigure) => (
        <AppointmentSetupChecklist
            savedAvailability={savedActivation.hasAvailability}
            savedEnabled={savedActivation.enabled}
            publicLink={settings.publicLink}
            onConfigure={onConfigure}
        />
    );

    if (loadingAuth) {
        return (
            <ExpensePageLayout
                title="Citas"
                subtitle="Gestiona solicitudes y configura tu agenda pública."
            >
                <p className="text-sm text-slate-500">Cargando…</p>
            </ExpensePageLayout>
        );
    }

    if (!appointmentsAllowed || planBlocked) {
        return <AppointmentsPlanNotice />;
    }

    return (
        <ExpensePageLayout
            title="Citas"
            subtitle="Gestiona solicitudes y configura tu agenda pública."
            actions={
                shareReady ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={settings.publicLink}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
                        >
                            <FaExternalLinkAlt aria-hidden="true" />
                            Vista previa
                        </a>
                        <button type="button" onClick={copyLink} className={PRIMARY_BUTTON}>
                            <FaCopy className="text-sm" aria-hidden="true" />
                            Copiar enlace
                        </button>
                    </div>
                ) : null
            }
        >
            <ExpenseAnimatedSection>
                <div className="flex gap-2 border-b border-slate-200">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
                            aria-pressed={tab === item.id}
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

            {settingsError && (
                <ExpenseAnimatedSection className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p role="alert" className="text-sm text-red-800">No se pudo cargar la configuración de citas.</p>
                    <button type="button" onClick={loadSettings} className="text-sm font-semibold text-red-800 underline">
                        Reintentar configuración
                    </button>
                </ExpenseAnimatedSection>
            )}

            {tab === "settings" ? (
                <ExpenseAnimatedSection className="space-y-6">
                    {loadingSettings ? (
                        <p className="text-sm text-slate-500">Cargando configuración…</p>
                    ) : !settingsError && (
                        <>
                            {setupChecklist()}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Horarios semanales
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={applyWeekdayTemplate}
                                            className="text-sm font-medium text-slate-600 hover:underline"
                                        >
                                            Lunes a viernes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addAvailabilityRow}
                                            className="text-sm font-medium text-emerald-700 hover:underline"
                                        >
                                            + Agregar franja
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Las horas usan la zona horaria del negocio.
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

                            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Habilitar citas
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Activa esta opción y guarda para recibir solicitudes desde tu enlace público.
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
                                        Enlace público
                                    </div>
                                    <p className="text-sm text-slate-800 break-all">
                                        {shareReady ? settings.publicLink : "Disponible cuando guardes la agenda activa con horarios."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <label className="text-sm block">
                                        <span className="font-medium text-slate-700">
                                            Duración de cada cita (min)
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
                                    <label className="text-sm block">
                                        <span className="font-medium text-slate-700">
                                            Citas en el mismo horario
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={20}
                                            value={settings.maxConcurrentPerSlot}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    maxConcurrentPerSlot: e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                        />
                                        <span className="mt-1 block text-xs text-slate-500">
                                            1 deja una sola reserva por hora. Un número mayor permite varias a la misma hora.
                                        </span>
                                    </label>
                                </div>

                                <label className="flex items-start gap-3 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(settings.customerNotificationsEnabled)}
                                        onChange={(e) =>
                                            setSettings((prev) => ({
                                                ...prev,
                                                customerNotificationsEnabled: e.target.checked,
                                            }))
                                        }
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
                                    />
                                    <span>
                                        <span className="font-medium text-slate-800">Avisar al cliente por correo</span>
                                        <span className="block text-slate-500 mt-1">
                                            Si el cliente indica su correo, recibe avisos al solicitar, confirmar, cambiar o cancelar una hora. Tú también recibes un aviso cuando entra una solicitud nueva.
                                        </span>
                                    </span>
                                </label>

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

                            <AppointmentBrandingSettings
                                businessId={activeBusinessId}
                                value={{
                                    galleryImageUrls: settings.galleryImageUrls,
                                    locationAddress: settings.locationAddress,
                                    locationLatitude: settings.locationLatitude,
                                    locationLongitude: settings.locationLongitude,
                                }}
                                pendingUploads={pendingGalleryUploads}
                                onPendingUploadsChange={setPendingGalleryUploads}
                                onChange={(branding) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        ...branding,
                                    }))
                                }
                            />

                            <div className="sticky bottom-0 z-10 flex justify-end rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                <button
                                    type="button"
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className={PRIMARY_BUTTON}
                                >
                                    {saving ? "Guardando…" : "Guardar configuración"}
                                </button>
                            </div>
                        </>
                    )}
                </ExpenseAnimatedSection>
            ) : (
                <ExpenseAnimatedSection className="space-y-4">
                    {!loadingSettings && !settingsError && !shareReady && setupChecklist(() => setTab("settings"))}
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm text-slate-600 flex items-center gap-2">
                            Estado
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            >
                                <option value="ACTIVE">Citas activas</option>
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
                    ) : listError ? (
                        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <p role="alert" className="text-sm text-red-800">No se pudieron cargar las citas.</p>
                            <button type="button" onClick={loadAppointments} className="text-sm font-semibold text-red-800 underline">
                                Reintentar citas
                            </button>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                            <FaCalendarAlt className="mx-auto text-slate-300 text-3xl mb-3" />
                            <p className="text-sm text-slate-600">No hay citas en este filtro.</p>
                            {shareReady && statusFilter === "ACTIVE" && (
                                <p className="mt-1 text-xs text-slate-500">
                                    Comparte el enlace público para recibir solicitudes.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {appointmentGroups.map((group) => (
                                <section
                                    key={group.id}
                                    aria-labelledby={group.label ? `appointment-group-${group.id}` : undefined}
                                    className="space-y-3"
                                >
                                    {group.label && (
                                        <h2 id={`appointment-group-${group.id}`} className="text-base font-semibold text-slate-900">
                                            {group.label}
                                        </h2>
                                    )}
                                    {group.appointments.map((appt) => {
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
                                                            <time dateTime={appt.startsAt}>
                                                                {formatAppointmentTime(appt.startsAt, timezone)}
                                                            </time>
                                                            {appt.status === "PENDING" && appointmentDay(appt.startsAt, timezone) === today && (
                                                                <span className="ml-2 text-xs font-semibold text-emerald-700">Hoy</span>
                                                            )}
                                                        </p>
                                                        {phoneLabel && (
                                                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                                                <FaPhoneAlt className="text-xs" aria-hidden="true" />
                                                                {phoneLabel}
                                                            </p>
                                                        )}
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
                                                            <FaWhatsapp aria-hidden="true" />
                                                            Contactar
                                                        </a>
                                                    ) : null}
                                                    {appt.status === "PENDING" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStatus(appt, "CONFIRMED")}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm font-medium"
                                                        >
                                                            <FaCheck aria-hidden="true" />
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
                                                                disabled={rescheduleSaving}
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
                                                                onClick={closeReschedule}
                                                                disabled={rescheduleSaving}
                                                                className="text-xs text-slate-500 hover:text-slate-800"
                                                            >
                                                                Cerrar
                                                            </button>
                                                        </div>
                                                        {rescheduleLoading ? (
                                                            <p className="text-sm text-slate-500">Cargando horarios…</p>
                                                        ) : rescheduleError ? (
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p role="alert" className="text-sm text-red-700">{rescheduleError}</p>
                                                                <button
                                                                    type="button"
                                                                    className="text-sm font-semibold underline"
                                                                    onClick={() => openReschedule(appt)}
                                                                >
                                                                    Reintentar horarios
                                                                </button>
                                                            </div>
                                                        ) : rescheduleSlots.length === 0 ? (
                                                            <p className="text-sm text-amber-700">No hay otros horarios libres.</p>
                                                        ) : (
                                                            <>
                                                                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                                                                    {rescheduleSlots.map((slot) => (
                                                                        <button
                                                                            key={slot.startsAt}
                                                                            type="button"
                                                                            disabled={rescheduleSaving}
                                                                            aria-pressed={selectedReplacement === slot.startsAt}
                                                                            onClick={() => setSelectedReplacement(slot.startsAt)}
                                                                            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 hover:border-emerald-500 aria-pressed:border-emerald-700 aria-pressed:bg-emerald-50"
                                                                        >
                                                                            {formatAppointmentTime(slot.startsAt, timezone)}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => applyReschedule(appt)}
                                                                    disabled={!selectedReplacement || rescheduleSaving}
                                                                    className={`mt-3 ${PRIMARY_BUTTON}`}
                                                                >
                                                                    Revisar cambio
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </section>
                            ))}
                        </div>
                    )}
                </ExpenseAnimatedSection>
            )}
        </ExpensePageLayout>
    );
}

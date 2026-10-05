import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
    FaCheckCircle,
    FaChevronDown,
    FaChevronLeft,
    FaChevronRight,
    FaExclamationTriangle,
    FaStore,
} from "react-icons/fa";
import {
    createPublicAppointment,
    fetchPublicAppointmentPage,
    fetchPublicAppointmentSlots,
} from "../../api/publicAppointments.js";
import {
    isValidChileMobile,
    normalizeChileMobileInput,
} from "../../utils/chilePhone.js";
import {
    WEEKDAY_LABELS,
    buildMonthCells,
    formatDateLabel,
    formatDayNumber,
    formatMonthTitle,
} from "./appointmentBookingCalendar.ts";
import AppointmentGalleryCarousel from "./AppointmentGalleryCarousel.tsx";
import AppointmentLocationSection from "./AppointmentLocationSection.tsx";

function groupSlotsByDate(slots) {
    const map = new Map();
    for (const slot of slots || []) {
        const key = slot.dateKey;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(slot);
    }
    return [...map.entries()];
}

const emptyForm = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    contactConsent: false,
    notes: "",
    customerEmail: "",
    startsAt: "",
};

const fieldClass =
    "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7a4e]/50";

const STEPS = [
    { id: 1, label: "Horario" },
    { id: 2, label: "Datos" },
    { id: 3, label: "Confirmar" },
];

function detailsError(form, notificationsEnabled) {
    if (!form.firstName.trim() || !form.lastName.trim()) {
        return "Ingresa tu nombre y apellido.";
    }
    if (!isValidChileMobile(form.phoneNumber)) {
        return "Ingresa un celular chileno válido (9 dígitos, comienza con 9).";
    }
    if (!form.contactConsent) {
        return "Debes autorizar que te contacten.";
    }
    if (notificationsEnabled) {
        const email = form.customerEmail.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return "Ingresa un correo válido para recibir el aviso de tu cita.";
        }
    }
    return null;
}

function phoneHref(phone) {
    const value = String(phone || "").replace(/[^\d+]/g, "");
    return value ? `tel:${value}` : null;
}

function BookingIdentity({ business }) {
    return (
        <div className="flex items-center gap-4">
            {business?.logoUrl ? (
                <img
                    src={business.logoUrl}
                    alt=""
                    className="h-16 w-16 rounded-2xl border border-slate-200 bg-white object-contain"
                />
            ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f6ef] text-[#0c7a4e]">
                    <FaStore className="text-xl" aria-hidden="true" />
                </div>
            )}
            <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold leading-tight text-dark">
                    {business?.name || "Negocio"}
                </h1>
                {business?.phone ? (
                    <a
                        href={phoneHref(business.phone) || undefined}
                        className="mt-1 block text-sm text-slate-600 no-underline hover:text-dark"
                    >
                        {business.phone}
                    </a>
                ) : null}
            </div>
        </div>
    );
}

export default function PublicRegisterAppointmentPage() {
    const { businessId } = useParams();
    const reduceMotion = useReducedMotion();
    const [page, setPage] = useState(null);
    const [slots, setSlots] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [selectedDate, setSelectedDate] = useState("");
    const [visibleMonth, setVisibleMonth] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [step, setStep] = useState(1);
    const skipStepScroll = useRef(true);

    useEffect(() => {
        const name = page?.business?.name;
        document.title = name ? `Agendar cita | ${name}` : "Agendar cita | AppsFly";
    }, [page?.business?.name]);

    useEffect(() => {
        if (skipStepScroll.current) {
            skipStepScroll.current = false;
            return;
        }
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }, [step, reduceMotion]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetchPublicAppointmentPage(businessId);
                if (cancelled) return;
                setPage(res.data);
                if (res.data.available) {
                    setSlotsLoading(true);
                    const slotsRes = await fetchPublicAppointmentSlots(businessId);
                    if (!cancelled) {
                        setSlots(slotsRes.data.slots || []);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message
                            || "No se pudo cargar el agendamiento.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setSlotsLoading(false);
                }
            }
        }

        if (businessId) load();
        else {
            setError("Enlace inválido.");
            setIsLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [businessId]);

    const grouped = useMemo(() => groupSlotsByDate(slots), [slots]);
    const openDates = useMemo(() => new Set(grouped.map(([dateKey]) => dateKey)), [grouped]);
    const monthKeys = useMemo(
        () => [...new Set(grouped.map(([dateKey]) => dateKey.slice(0, 7)))].sort(),
        [grouped],
    );

    useEffect(() => {
        if (!selectedDate && grouped.length) {
            const firstDate = grouped[0][0];
            setSelectedDate(firstDate);
            setVisibleMonth(firstDate.slice(0, 7));
        }
    }, [grouped, selectedDate]);

    const daySlots = useMemo(() => {
        const entry = grouped.find(([key]) => key === selectedDate);
        return entry?.[1] || [];
    }, [grouped, selectedDate]);

    const activeMonth = visibleMonth || monthKeys[0] || "";
    const monthCells = useMemo(
        () => (activeMonth ? buildMonthCells(activeMonth) : []),
        [activeMonth],
    );
    const monthIndex = monthKeys.indexOf(activeMonth);
    const business = page?.business;
    const selectedSlot = daySlots.find((slot) => slot.startsAt === form.startsAt) || null;

    const chooseDate = (dateKey) => {
        setSelectedDate(dateKey);
        setVisibleMonth(dateKey.slice(0, 7));
        setFieldError(null);
        setForm((prev) => ({ ...prev, startsAt: "" }));
    };

    const onChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFieldError(null);
        if (name === "phoneNumber") {
            setForm((prev) => ({
                ...prev,
                phoneNumber: normalizeChileMobileInput(value),
            }));
            return;
        }
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const continueFromSchedule = () => {
        if (!form.startsAt) {
            setFieldError("Selecciona un horario disponible.");
            return;
        }
        setFieldError(null);
        setStep(2);
    };

    const continueFromDetails = () => {
        const message = detailsError(form, page?.customerNotificationsEnabled);
        if (message) {
            setFieldError(message);
            return;
        }
        setFieldError(null);
        setStep(3);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (step !== 3) return;
        setFieldError(null);

        const message = detailsError(form, page?.customerNotificationsEnabled);
        if (message) {
            setFieldError(message);
            setStep(2);
            return;
        }
        if (!form.startsAt) {
            setFieldError("Selecciona un horario disponible.");
            setStep(1);
            return;
        }

        setSubmitting(true);
        try {
            const res = await createPublicAppointment(businessId, {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phoneCode: "+56",
                phoneNumber: form.phoneNumber.trim(),
                contactConsent: true,
                customerEmail: page?.customerNotificationsEnabled ? form.customerEmail.trim() : null,
                startsAt: form.startsAt,
                notes: form.notes.trim() || null,
            });
            setSuccess(res.data.appointment);
            setForm(emptyForm);
        } catch (err) {
            setFieldError(
                err.response?.data?.message
                    || "No se pudo agendar la cita. Intenta con otro horario.",
            );
            if (err.response?.status === 409) {
                try {
                    const slotsRes = await fetchPublicAppointmentSlots(businessId);
                    setSlots(slotsRes.data.slots || []);
                    setForm((prev) => ({ ...prev, startsAt: "" }));
                    setStep(1);
                } catch {
                    /* ignore refresh errors */
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[100dvh] bg-surface font-sans">
                <p className="sr-only">Cargando el agendamiento</p>
                <div className="mx-auto grid min-h-[100dvh] max-w-6xl lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]">
                    <div className="h-44 animate-pulse bg-slate-200 lg:h-[100dvh]" />
                    <div className="space-y-4 px-4 py-8">
                        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" />
                        <div className="h-72 animate-pulse rounded-2xl bg-white" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-surface px-4 font-sans">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <FaExclamationTriangle className="mx-auto mb-4 text-3xl text-amber-600" aria-hidden="true" />
                    <h1 className="mb-2 font-display text-lg font-bold text-dark">Agendamiento no disponible</h1>
                    <p className="text-sm text-slate-600">{error || "Enlace inválido."}</p>
                    <Link to="/" className="mt-6 inline-block text-sm font-medium text-[#0c7a4e] no-underline hover:underline">
                        Ir a AppsFly
                    </Link>
                </div>
            </div>
        );
    }

    if (!page.available) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-surface px-4 font-sans">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mb-5 flex justify-center">
                        <BookingIdentity business={business} />
                    </div>
                    <p className="text-sm text-slate-600">
                        {page.message || "El agendamiento no está disponible en este momento."}
                    </p>
                </div>
            </div>
        );
    }

    if (success) {
        const when = new Date(success.startsAt).toLocaleString("es-CL", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        });
        return (
            <div className="min-h-[100dvh] bg-surface font-sans">
                <AppointmentGalleryCarousel
                    imageUrls={page?.galleryImageUrls}
                    alt={`Local de ${business?.name || "negocio"}`}
                    className="h-48 w-full sm:h-64"
                />
                <div className="mx-auto w-full max-w-md px-4 py-8 text-center">
                    <FaCheckCircle className="mx-auto mb-4 text-4xl text-[#0c7a4e]" aria-hidden="true" />
                    <h1 className="mb-2 font-display text-2xl font-bold text-dark">Solicitud enviada</h1>
                    <p className="text-sm text-slate-600">
                        {business?.name} recibió tu solicitud de cita.
                    </p>
                    <p className="mt-4 rounded-2xl bg-white px-4 py-4 font-medium text-dark shadow-sm first-letter:uppercase">
                        {when}
                    </p>
                    <p className="mt-4 text-sm text-slate-500">
                        {success.customerEmail
                            ? `Te escribiremos a ${success.customerEmail} cuando confirmen la hora.`
                            : `Te contactarán al +56 ${success.phoneNumber} para confirmar.`}
                    </p>
                    {page?.location ? (
                        <div className="mt-6 text-left">
                            <AppointmentLocationSection location={page.location} compact />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-surface font-sans text-slate-900">
            <div className="mx-auto grid min-h-[100dvh] max-w-6xl lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]">
                <aside className="bg-white lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col lg:overflow-y-auto">
                    <AppointmentGalleryCarousel
                        imageUrls={page.galleryImageUrls}
                        alt={`Local de ${business?.name || "negocio"}`}
                        className={`h-40 w-full sm:h-48 lg:h-64 ${step === 1 ? "" : "hidden lg:block"}`}
                    />
                    <div className="px-4 py-4 lg:px-8 lg:py-8">
                        <BookingIdentity business={business} />
                        <p className={`mt-4 text-sm leading-relaxed text-slate-600 ${step === 1 ? "" : "hidden lg:block"}`}>
                            {page.visitorMessage
                                || "Elige un día y una hora. Te contactaremos para confirmar."}
                        </p>
                        {page.slotDurationMinutes ? (
                            <p className={`mt-3 text-sm font-medium text-dark ${step === 1 ? "" : "hidden lg:block"}`}>
                                Cada cita dura {page.slotDurationMinutes} minutos.
                            </p>
                        ) : null}
                        {page.location ? (
                            <div className={`mt-5 ${step === 1 ? "" : "hidden lg:block"}`}>
                                <AppointmentLocationSection location={page.location} />
                            </div>
                        ) : null}
                    </div>
                </aside>

                <main className={`px-4 pt-2 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10 ${step === 1 ? "pb-8" : "pb-28"}`}>
                    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl">
                        <ol aria-label="Progreso de la reserva" className="grid grid-cols-3 gap-2">
                            {STEPS.map((item) => {
                                const current = item.id === step;
                                const done = item.id < step;
                                return (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            disabled={item.id > step}
                                            aria-current={current ? "step" : undefined}
                                            onClick={() => {
                                                if (item.id >= step) return;
                                                setFieldError(null);
                                                setStep(item.id);
                                            }}
                                            className="w-full text-left disabled:cursor-default disabled:opacity-100"
                                        >
                                            <span
                                                className={`block h-1 rounded-full ${
                                                    current || done ? "bg-[#0c7a4e]" : "bg-slate-200"
                                                }`}
                                            />
                                            <span className={`mt-2 block text-xs font-medium ${current ? "text-dark" : "text-slate-500"}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>

                        <motion.div
                            key={step}
                            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        >
                        {step === 1 ? (
                        <section aria-labelledby="dia-heading" className="mt-5">
                            <h2 id="dia-heading" className="font-display text-xl font-bold text-dark">
                                Día y hora
                            </h2>
                            {slotsLoading ? (
                                <p className="mt-4 text-sm text-slate-500">Cargando horarios…</p>
                            ) : grouped.length === 0 ? (
                                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                    No hay horarios disponibles por ahora. Intenta más tarde.
                                </p>
                            ) : (
                                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            aria-label="Mes anterior"
                                            disabled={monthIndex <= 0}
                                            onClick={() => setVisibleMonth(monthKeys[monthIndex - 1])}
                                            className="flex h-10 w-10 items-center justify-center rounded-full text-dark transition-transform active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-30"
                                        >
                                            <FaChevronLeft aria-hidden="true" />
                                        </button>
                                        <p className="text-sm font-semibold capitalize text-dark">
                                            {formatMonthTitle(activeMonth)}
                                        </p>
                                        <button
                                            type="button"
                                            aria-label="Mes siguiente"
                                            disabled={monthIndex < 0 || monthIndex >= monthKeys.length - 1}
                                            onClick={() => setVisibleMonth(monthKeys[monthIndex + 1])}
                                            className="flex h-10 w-10 items-center justify-center rounded-full text-dark transition-transform active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-30"
                                        >
                                            <FaChevronRight aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
                                        {WEEKDAY_LABELS.map((label) => (
                                            <span key={label}>{label}</span>
                                        ))}
                                    </div>
                                    <div className="mt-1 grid grid-cols-7 gap-1">
                                        {monthCells.map((dateKey, index) => {
                                            if (!dateKey || !openDates.has(dateKey)) {
                                                return (
                                                    <span
                                                        key={dateKey || `empty-${index}`}
                                                        className="flex aspect-square items-center justify-center text-sm text-slate-300"
                                                    >
                                                        {dateKey ? formatDayNumber(dateKey) : ""}
                                                    </span>
                                                );
                                            }
                                            const selected = selectedDate === dateKey;
                                            return (
                                                <button
                                                    key={dateKey}
                                                    type="button"
                                                    aria-pressed={selected}
                                                    aria-label={formatDateLabel(dateKey)}
                                                    onClick={() => chooseDate(dateKey)}
                                                    className={
                                                        selected
                                                            ? "flex aspect-square items-center justify-center rounded-full bg-[#0c7a4e] text-sm font-semibold text-white transition-transform active:scale-[0.98] motion-reduce:active:scale-100"
                                                            : "flex aspect-square items-center justify-center rounded-full bg-[#e7f6ef] text-sm font-medium text-[#0c7a4e] transition-transform hover:bg-[#d7f0e4] active:scale-[0.98] motion-reduce:active:scale-100"
                                                    }
                                                >
                                                    {formatDayNumber(dateKey)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedDate && daySlots.length > 0 ? (
                                    <motion.div
                                        key={selectedDate}
                                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="mt-4"
                                    >
                                        <p className="text-sm text-slate-500 first-letter:uppercase">
                                            {formatDateLabel(selectedDate)}
                                        </p>
                                        <label className="mt-2 block text-sm font-medium text-slate-800" htmlFor="hora-cita">
                                            Hora
                                        </label>
                                        <div className="relative mt-1.5">
                                            <select
                                                id="hora-cita"
                                                name="startsAt"
                                                value={form.startsAt}
                                                onChange={onChange}
                                                className={`${fieldClass} !mt-0 appearance-none pr-10`}
                                            >
                                                <option value="">Elige una hora</option>
                                                {daySlots.map((slot) => (
                                                    <option key={slot.startsAt} value={slot.startsAt}>
                                                        {slot.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <FaChevronDown
                                                aria-hidden="true"
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-dark"
                                            />
                                        </div>
                                    </motion.div>
                            ) : null}
                        </section>
                        ) : null}

                        {step === 2 ? (
                        <section aria-labelledby="datos-heading" className="mt-5 space-y-4">
                            <h2 id="datos-heading" className="font-display text-xl font-bold text-dark">
                                Tus datos
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="block text-sm">
                                    <span className="font-medium text-slate-800">Nombre</span>
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={onChange}
                                        className={fieldClass}
                                        autoComplete="given-name"
                                        required
                                    />
                                </label>
                                <label className="block text-sm">
                                    <span className="font-medium text-slate-800">Apellido</span>
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={onChange}
                                        className={fieldClass}
                                        autoComplete="family-name"
                                        required
                                    />
                                </label>
                            </div>

                            <label className="block text-sm">
                                <span className="font-medium text-slate-800">Celular</span>
                                <div className="mt-1.5 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-[#0c7a4e]/50">
                                    <span className="select-none border-r border-slate-300 bg-slate-50 px-3 py-3 text-slate-700">
                                        +56
                                    </span>
                                    <input
                                        name="phoneNumber"
                                        value={form.phoneNumber}
                                        onChange={onChange}
                                        inputMode="numeric"
                                        autoComplete="tel-national"
                                        placeholder="9XXXXXXXX"
                                        className="flex-1 px-3 py-3 text-base text-slate-900 placeholder:text-slate-600 focus:outline-none"
                                        required
                                    />
                                </div>
                            </label>

                            {page.customerNotificationsEnabled ? (
                                <label className="block text-sm">
                                    <span className="font-medium text-slate-800">Correo</span>
                                    <input
                                        name="customerEmail"
                                        type="email"
                                        value={form.customerEmail}
                                        onChange={onChange}
                                        autoComplete="email"
                                        placeholder="tu@correo.cl"
                                        className={`${fieldClass} placeholder:text-slate-600`}
                                        required
                                    />
                                    <span className="mt-1 block text-xs text-slate-600">
                                        Te avisaremos aquí cuando la cita se confirme, cambie o se cancele.
                                    </span>
                                </label>
                            ) : null}

                            <label className="block text-sm">
                                <span className="font-medium text-slate-800">Comentario (opcional)</span>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={onChange}
                                    rows={3}
                                    className={fieldClass}
                                    maxLength={500}
                                />
                            </label>

                            <label className="flex items-start gap-3 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    name="contactConsent"
                                    checked={form.contactConsent}
                                    onChange={onChange}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0c7a4e] focus:ring-[#0c7a4e]"
                                />
                                <span>
                                    Autorizo a <strong>{business?.name}</strong> a contactarme por celular
                                    o WhatsApp respecto a esta cita.
                                </span>
                            </label>
                        </section>
                        ) : null}

                        {step === 3 && selectedSlot ? (
                            <section aria-labelledby="confirma-heading" className="mt-5 space-y-3">
                                <h2 id="confirma-heading" className="font-display text-xl font-bold text-dark">
                                    Confirma tu cita
                                </h2>
                                <div className="rounded-2xl bg-white px-4 py-4 text-dark shadow-sm">
                                    <p className="text-sm text-slate-500">Horario</p>
                                    <p className="mt-1 first-letter:uppercase">{formatDateLabel(selectedDate)}</p>
                                    <p className="text-2xl font-semibold tabular-nums">{selectedSlot.label}</p>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="mt-2 text-sm font-medium text-[#0c7a4e]"
                                    >
                                        Cambiar horario
                                    </button>
                                </div>
                                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-dark shadow-sm">
                                    <p className="text-slate-500">Contacto</p>
                                    <p className="mt-1 font-medium">{form.firstName.trim()} {form.lastName.trim()}</p>
                                    <p>+56 {form.phoneNumber}</p>
                                    {page.customerNotificationsEnabled ? <p>{form.customerEmail.trim()}</p> : null}
                                    {form.notes.trim() ? <p className="mt-2 text-slate-600">{form.notes.trim()}</p> : null}
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="mt-2 text-sm font-medium text-[#0c7a4e]"
                                    >
                                        Cambiar datos
                                    </button>
                                </div>
                            </section>
                        ) : null}
                        </motion.div>

                        <div className={step === 1
                            ? "mt-6"
                            : "fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:static lg:inset-auto lg:mt-8 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none"}>
                            {fieldError ? (
                                <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {fieldError}
                                </p>
                            ) : null}
                            <div className="flex gap-3 pb-[env(safe-area-inset-bottom)]">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFieldError(null);
                                            setStep(step - 1);
                                        }}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-dark active:scale-[0.98] motion-reduce:active:scale-100"
                                    >
                                        Atrás
                                    </button>
                                ) : null}
                                {step === 1 ? (
                                    <button
                                        type="button"
                                        onClick={continueFromSchedule}
                                        disabled={grouped.length === 0 || slotsLoading}
                                        className="min-h-12 flex-1 rounded-xl bg-[#0c7a4e] py-3 font-semibold text-white hover:bg-[#0a6842] active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-60 disabled:active:scale-100"
                                    >
                                        Continuar
                                    </button>
                                ) : null}
                                {step === 2 ? (
                                    <button
                                        type="button"
                                        onClick={continueFromDetails}
                                        className="min-h-12 flex-1 rounded-xl bg-[#0c7a4e] py-3 font-semibold text-white hover:bg-[#0a6842] active:scale-[0.98] motion-reduce:active:scale-100"
                                    >
                                        Continuar
                                    </button>
                                ) : null}
                                {step === 3 ? (
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="min-h-12 flex-1 rounded-xl bg-[#0c7a4e] py-3 font-semibold text-white hover:bg-[#0a6842] active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-60 disabled:active:scale-100"
                                    >
                                        {submitting ? "Enviando…" : "Solicitar cita"}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </form>

                    <p className="mx-auto mt-8 max-w-xl text-center text-xs text-slate-500">
                        Powered by{" "}
                        <Link to="/" className="text-slate-600 no-underline hover:underline">
                            AppsFly
                        </Link>
                    </p>
                </main>
            </div>
        </div>
    );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaCheckCircle, FaExclamationTriangle, FaStore } from "react-icons/fa";
import {
    createPublicAppointment,
    fetchPublicAppointmentPage,
    fetchPublicAppointmentSlots,
} from "../../api/publicAppointments.js";
import {
    isValidChileMobile,
    normalizeChileMobileInput,
} from "../../utils/chilePhone.js";

function groupSlotsByDate(slots) {
    const map = new Map();
    for (const slot of slots || []) {
        const key = slot.dateKey;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(slot);
    }
    return [...map.entries()];
}

function formatDateLabel(dateKey) {
    const [y, m, d] = String(dateKey).split("-").map(Number);
    if (!y || !m || !d) return dateKey;
    return new Date(y, m - 1, d).toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

const emptyForm = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    contactConsent: false,
    notes: "",
    startsAt: "",
};

export default function PublicRegisterAppointmentPage() {
    const { businessId } = useParams();
    const [page, setPage] = useState(null);
    const [slots, setSlots] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [selectedDate, setSelectedDate] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState(null);
    const [success, setSuccess] = useState(null);

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

    useEffect(() => {
        if (!selectedDate && grouped.length) {
            setSelectedDate(grouped[0][0]);
        }
    }, [grouped, selectedDate]);

    const daySlots = useMemo(() => {
        const entry = grouped.find(([key]) => key === selectedDate);
        return entry?.[1] || [];
    }, [grouped, selectedDate]);

    const business = page?.business;

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFieldError(null);

        if (!form.firstName.trim() || !form.lastName.trim()) {
            setFieldError("Ingresa tu nombre y apellido.");
            return;
        }
        if (!isValidChileMobile(form.phoneNumber)) {
            setFieldError("Ingresa un celular chileno válido (9 dígitos, comienza con 9).");
            return;
        }
        if (!form.contactConsent) {
            setFieldError("Debes autorizar que te contacten.");
            return;
        }
        if (!form.startsAt) {
            setFieldError("Selecciona un horario disponible.");
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
            <div className="min-h-screen bg-slate-100 flex items-center justify-center font-montserrat">
                <div className="inline-flex items-center gap-3 text-sm text-slate-500">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-600" />
                    Cargando…
                </div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 font-montserrat">
                <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
                    <FaExclamationTriangle className="mx-auto text-amber-500 text-3xl mb-4" />
                    <h1 className="text-lg font-bold text-slate-900 mb-2">Agendamiento no disponible</h1>
                    <p className="text-sm text-slate-600">{error || "Enlace inválido."}</p>
                    <Link to="/" className="inline-block mt-6 text-sm font-medium text-emerald-700 hover:underline no-underline">
                        Ir a AppsFly
                    </Link>
                </div>
            </div>
        );
    }

    if (!page.available) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 font-montserrat">
                <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
                    {business?.logoUrl ? (
                        <img
                            src={business.logoUrl}
                            alt={business.name}
                            className="mx-auto h-14 w-14 rounded-lg object-contain border border-slate-100 mb-4"
                        />
                    ) : (
                        <FaStore className="mx-auto text-slate-400 text-3xl mb-4" />
                    )}
                    <h1 className="text-xl font-bold text-slate-900 mb-1">{business?.name || "Negocio"}</h1>
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
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 font-montserrat">
                <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
                    <FaCheckCircle className="mx-auto text-emerald-600 text-4xl mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Solicitud enviada</h1>
                    <p className="text-sm text-slate-600 mb-1">
                        {business?.name} recibió tu solicitud de cita.
                    </p>
                    <p className="text-sm font-medium text-slate-800 capitalize">{when}</p>
                    <p className="text-xs text-slate-500 mt-4">
                        Te contactarán al +56 {success.phoneNumber} para confirmar.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-emerald-50/40 font-montserrat">
            <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
                <div className="max-w-xl mx-auto px-4 py-6 flex items-center gap-4">
                    {business?.logoUrl ? (
                        <img
                            src={business.logoUrl}
                            alt={business.name}
                            className="h-14 w-14 rounded-xl object-contain border border-slate-100 bg-white"
                        />
                    ) : (
                        <div className="h-14 w-14 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <FaStore className="text-xl" />
                        </div>
                    )}
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Agendar cita</p>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{business?.name}</h1>
                        {business?.phone ? (
                            <p className="text-sm text-slate-500 mt-0.5">{business.phone}</p>
                        ) : null}
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-8">
                {page.visitorMessage ? (
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">{page.visitorMessage}</p>
                ) : (
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                        Elige un horario disponible y deja tus datos. Te contactaremos para confirmar.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block text-sm">
                            <span className="text-slate-700 font-medium">Nombre</span>
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                autoComplete="given-name"
                                required
                            />
                        </label>
                        <label className="block text-sm">
                            <span className="text-slate-700 font-medium">Apellido</span>
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                autoComplete="family-name"
                                required
                            />
                        </label>
                    </div>

                    <label className="block text-sm">
                        <span className="text-slate-700 font-medium">Celular</span>
                        <div className="mt-1 flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/40">
                            <span className="px-3 py-2.5 bg-slate-50 text-slate-600 border-r border-slate-300 select-none">
                                +56
                            </span>
                            <input
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={onChange}
                                inputMode="numeric"
                                placeholder="9XXXXXXXX"
                                className="flex-1 px-3 py-2.5 text-slate-900 focus:outline-none"
                                required
                            />
                        </div>
                    </label>

                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Fecha</p>
                        {slotsLoading ? (
                            <p className="text-sm text-slate-500">Cargando horarios…</p>
                        ) : grouped.length === 0 ? (
                            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                No hay horarios disponibles por ahora. Intenta más tarde.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {grouped.map(([dateKey]) => (
                                    <button
                                        key={dateKey}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDate(dateKey);
                                            setForm((prev) => ({ ...prev, startsAt: "" }));
                                        }}
                                        className={
                                            selectedDate === dateKey
                                                ? "rounded-lg bg-emerald-600 text-white px-3 py-2 text-xs font-medium capitalize"
                                                : "rounded-lg border border-slate-300 bg-white text-slate-700 px-3 py-2 text-xs font-medium capitalize hover:border-emerald-400"
                                        }
                                    >
                                        {formatDateLabel(dateKey)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {daySlots.length > 0 ? (
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Hora</p>
                            <div className="flex flex-wrap gap-2">
                                {daySlots.map((slot) => (
                                    <button
                                        key={slot.startsAt}
                                        type="button"
                                        onClick={() =>
                                            setForm((prev) => ({ ...prev, startsAt: slot.startsAt }))
                                        }
                                        className={
                                            form.startsAt === slot.startsAt
                                                ? "rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold"
                                                : "rounded-lg border border-slate-300 bg-white text-slate-800 px-3 py-2 text-sm hover:border-slate-500"
                                        }
                                    >
                                        {slot.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <label className="block text-sm">
                        <span className="text-slate-700 font-medium">Comentario (opcional)</span>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={onChange}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                            maxLength={500}
                        />
                    </label>

                    <label className="flex items-start gap-3 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            name="contactConsent"
                            checked={form.contactConsent}
                            onChange={onChange}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>
                            Autorizo a <strong>{business?.name}</strong> a contactarme por celular
                            o WhatsApp respecto a esta cita.
                        </span>
                    </label>

                    {fieldError ? (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {fieldError}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={submitting || grouped.length === 0}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 transition-colors"
                    >
                        {submitting ? "Enviando…" : "Solicitar cita"}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-8">
                    Powered by{" "}
                    <Link to="/" className="text-slate-500 no-underline hover:underline">
                        AppsFly
                    </Link>
                </p>
            </main>
        </div>
    );
}

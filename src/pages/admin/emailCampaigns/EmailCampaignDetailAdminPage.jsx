import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaArrowLeft,
    FaEnvelope,
    FaSave,
    FaTrash,
    FaUsers,
    FaInfoCircle,
    FaPaperPlane,
    FaCalendarAlt,
    FaEye,
    FaChartBar,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../../components/layout/PageContainer.jsx";
import SelectFloatingComponent from "../../../components/inputs/SelectFloatingComponent.jsx";
import {
    createEmailCampaignRequest,
    deleteEmailCampaignRequest,
    executeEmailCampaignRequest,
    getEmailCampaignMetadataRequest,
    getEmailCampaignRequest,
    getEmailCampaignStatsRequest,
    previewEmailCampaignAudienceRequest,
    updateEmailCampaignRequest,
} from "../../../api/adminEmailCampaign.js";
import {
    statusLabel,
    EMAIL_CAMPAIGN_STATUS_STYLES,
    scheduleModeLabel,
    scheduleDetailLabel,
    scheduleEligibilityLabel,
    buildManualExecuteMessage,
    isAutomatedCampaign,
    formatWeeklyRunDays,
    SCHEDULE_MODE_STYLES,
} from "../../../utils/adminEmailCampaignConstants.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { useConfirm } from "../../../context/ConfirmationContext.jsx";
import {
    PRIMARY_BTN,
} from "../../../utils/expenseUiPatterns.js";

const SECONDARY_BTN =
    "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 no-underline";

const EMPTY_FORM = {
    campaignName: "",
    campaignDescription: "",
    audienceType: "ALL_USERS",
    emailSubject: "",
    senderName: "",
    senderEmail: "",
    messageIntent: "",
    emailText: "",
    emailHtml: "",
    campaignStatus: "DRAFT",
    campaignKey: null,
    scheduleFrequency: "MANUAL",
    audienceParams: null,
    lastRunAt: null,
};

function FieldLabel({ children, hint }) {
    return (
        <div className="mb-1.5">
            <label className="block text-sm font-medium text-slate-700">{children}</label>
            {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
        </div>
    );
}

export default function EmailCampaignDetailAdminPage() {
    const { id } = useParams();
    const isNew = id === "new";
    const navigate = useNavigate();
    const toast = useToast();
    const confirm = useConfirm();

    const [form, setForm] = useState(EMPTY_FORM);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [audiencePreview, setAudiencePreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [executing, setExecuting] = useState(false);

    const isSystemCampaign = Boolean(form.campaignKey);

    const isEditable =
        isNew || form.campaignStatus === "DRAFT" || form.campaignStatus === "SCHEDULED";

    const loadMetadata = useCallback(async () => {
        try {
            const res = await getEmailCampaignMetadataRequest();
            setMetadata(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const loadCampaign = useCallback(async () => {
        if (isNew) return;
        setLoading(true);
        try {
            const res = await getEmailCampaignRequest(id);
            const c = res.data;
            setForm({
                campaignName: c.campaignName ?? "",
                campaignDescription: c.campaignDescription ?? "",
                audienceType: c.audienceType ?? "ALL_USERS",
                emailSubject: c.emailSubject ?? "",
                senderName: c.senderName ?? "",
                senderEmail: c.senderEmail ?? "",
                messageIntent: c.messageIntent ?? "",
                emailText: c.emailText ?? "",
                emailHtml: c.emailHtml ?? "",
                campaignStatus: c.campaignStatus ?? "DRAFT",
                campaignKey: c.campaignKey ?? null,
                scheduleFrequency: c.scheduleFrequency ?? "MANUAL",
                audienceParams: c.audienceParams ?? null,
                lastRunAt: c.lastRunAt ?? null,
            });
        } catch (err) {
            console.error(err);
            toast.error("Error", "No se pudo cargar la campaña.");
            navigate("/admin/email-campaigns");
        } finally {
            setLoading(false);
        }
    }, [id, isNew, navigate, toast]);

    const loadStats = useCallback(async () => {
        if (isNew) return;
        try {
            const res = await getEmailCampaignStatsRequest(id);
            setStats(res.data);
        } catch {
            setStats(null);
        }
    }, [id, isNew]);

    const loadAudiencePreview = useCallback(async (audienceType) => {
        setPreviewLoading(true);
        try {
            const res = await previewEmailCampaignAudienceRequest(audienceType);
            setAudiencePreview(res.data);
        } catch {
            setAudiencePreview(null);
        } finally {
            setPreviewLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMetadata();
        loadCampaign();
        loadStats();
    }, [loadMetadata, loadCampaign, loadStats]);

    useEffect(() => {
        if (form.audienceType) {
            loadAudiencePreview(form.audienceType);
        }
    }, [form.audienceType, loadAudiencePreview]);

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.campaignName.trim()) {
            toast.error("Validación", "El nombre de la campaña es obligatorio.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                campaignName: form.campaignName.trim(),
                campaignDescription: form.campaignDescription.trim() || null,
                audienceType: form.audienceType,
                emailSubject: form.emailSubject.trim() || null,
                senderName: form.senderName.trim() || null,
                senderEmail: form.senderEmail.trim() || null,
                messageIntent: form.messageIntent.trim() || null,
                emailText: form.emailText.trim() || null,
                emailHtml: form.emailHtml.trim() || null,
                campaignStatus: form.campaignStatus,
            };

            if (isNew) {
                const res = await createEmailCampaignRequest(payload);
                toast.success("Campaña creada", "Puedes seguir configurando el mensaje.");
                navigate(`/admin/email-campaigns/${res.data.campaignId}/settings`, { replace: true });
            } else {
                await updateEmailCampaignRequest(id, payload);
                toast.success("Guardado", "La campaña se actualizó correctamente.");
                await loadStats();
            }
        } catch (err) {
            toast.error(
                "Error",
                err.response?.data?.message ?? "No se pudo guardar la campaña.",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const ok = await confirm({
            title: "Eliminar campaña",
            message: "¿Eliminar esta campaña en borrador? Esta acción no se puede deshacer.",
            variant: "danger",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
        });
        if (!ok) return;

        try {
            await deleteEmailCampaignRequest(id);
            toast.success("Eliminada", "La campaña fue eliminada.");
            navigate("/admin/email-campaigns");
        } catch (err) {
            toast.error(
                "Error",
                err.response?.data?.message ?? "No se pudo eliminar la campaña.",
            );
        }
    };

    const handleExecute = async (force = false) => {
        const recipients = audiencePreview?.estimatedRecipients ?? 0;
        const ok = await confirm({
            title: force ? "Forzar envío mensual" : "Enviar campaña ahora",
            message: force
                ? `¿Forzar el envío aunque no haya pasado un mes desde el último? Se contactará a ~${recipients.toLocaleString("es-CL")} destinatario(s).`
                : buildManualExecuteMessage(form, recipients),
            variant: "danger",
            confirmText: force ? "Forzar envío" : "Enviar campaña",
            cancelText: "Cancelar",
        });
        if (!ok) return;

        setExecuting(true);
        try {
            await executeEmailCampaignRequest(id, { force });
            toast.success("Campaña enviada", "Revisa las métricas de entrega abajo.");
            await loadCampaign();
            await loadStats();
        } catch (err) {
            toast.error(
                "No se pudo enviar",
                err.response?.data?.message ?? "Error al ejecutar la campaña.",
            );
        } finally {
            setExecuting(false);
        }
    };

    const audienceOptions =
        metadata?.audienceTypes?.map((a) => ({ value: a.value, label: a.label })) ?? [];

    const statusStyle =
        EMAIL_CAMPAIGN_STATUS_STYLES[form.campaignStatus] ??
        EMAIL_CAMPAIGN_STATUS_STYLES.DRAFT;

    const monthlyEligible = stats?.monthlyEligibility?.allowed !== false;
    const sendEligible =
        form.scheduleFrequency === "MONTHLY" ? monthlyEligible : true;
    const schedulePending = stats?.scheduleEligibility?.due === true;
    const schedulePendingLabel = scheduleEligibilityLabel(stats?.scheduleEligibility);

    if (loading) {
        return (
            <PageContainer>
                <div className="py-20 text-center text-slate-400">Cargando campaña…</div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link
                    to="/admin/email-campaigns"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 no-underline"
                >
                    <FaArrowLeft /> Catálogo de campañas
                </Link>
                {!isNew && (
                    <Link
                        to={`/admin/email-campaigns/${id}`}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 no-underline"
                    >
                        <FaEye /> Ver campaña
                    </Link>
                )}
                {!isNew && (
                    <Link
                        to={`/admin/email-campaigns/${id}/history`}
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 no-underline"
                    >
                        <FaChartBar /> Ver resultados
                    </Link>
                )}
            </div>

            <PageHeader
                title={isNew ? "Nueva campaña de email" : `Configurar — ${form.campaignName || "Campaña"}`}
                subtitle={
                    isSystemCampaign
                        ? form.scheduleFrequency === "DAILY"
                          ? "Campaña del sistema · envío diario automático"
                          : form.scheduleFrequency === "WEEKLY"
                            ? "Campaña del sistema · envío semanal automático"
                          : form.scheduleFrequency === "MONTHLY"
                            ? "Campaña del sistema · frecuencia mensual"
                            : "Campaña del sistema"
                        : "Configura audiencia, mensaje y parámetros de envío."
                }
                actions={
                    !isNew && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => handleExecute(false)}
                                disabled={executing || !sendEligible}
                                className={PRIMARY_BTN}
                            >
                                <FaPaperPlane />
                                {executing ? "Enviando…" : "Enviar campaña"}
                            </button>
                            {form.scheduleFrequency === "MONTHLY" && !monthlyEligible && (
                                <button
                                    type="button"
                                    onClick={() => handleExecute(true)}
                                    disabled={executing}
                                    className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
                                >
                                    Forzar envío
                                </button>
                            )}
                        </div>
                    )
                }
            />

            {isSystemCampaign && !isNew && schedulePending && schedulePendingLabel && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex gap-3">
                    <FaInfoCircle className="shrink-0 mt-0.5 text-amber-600" />
                    <div>
                        <p className="font-medium">{schedulePendingLabel}</p>
                        <p className="mt-1 text-amber-800/90">
                            El servidor intentará enviarla automáticamente. Si prefieres no esperar,
                            usa <strong>Enviar campaña</strong> arriba para dispararla manualmente ahora.
                        </p>
                    </div>
                </div>
            )}

            {isSystemCampaign && !isNew && (
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-primary mb-1">
                        ¿De qué trata esta campaña?
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {form.campaignDescription ||
                            "Recordatorio mensual a administradores cuyo negocio no tiene suscripción activa y ve la pantalla de cuenta suspendida en AppsFly."}
                    </p>
                    {form.messageIntent && (
                        <p className="text-xs text-slate-500 mt-2">
                            <strong>Objetivo:</strong> {form.messageIntent}
                        </p>
                    )}
                    {form.scheduleFrequency === "WEEKLY" && stats?.autoSchedule && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <FaCalendarAlt />
                            Envío automático:{" "}
                            {formatWeeklyRunDays(stats.autoSchedule.autoRunWeekdays ?? [1, 3, 5])} a las{" "}
                            {stats.autoSchedule.hour}:00 ({stats.autoSchedule.timezone})
                            {stats.autoSchedule.maxOneEmailPerProspectPerMonth
                                ? " · máx. 1 correo/mes por prospecto · 3 variantes de mensaje"
                                : ""}
                            .
                            {stats.autoSchedule.enabled
                                ? " Activo en el servidor."
                                : " Programador desactivado en servidor."}
                        </p>
                    )}
                    {form.scheduleFrequency === "MONTHLY" && stats?.autoSchedule && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <FaCalendarAlt />
                            Envío automático: día {stats.autoSchedule.day} de cada mes a las{" "}
                            {stats.autoSchedule.hour}:00 ({stats.autoSchedule.timezone}).
                            {stats.autoSchedule.enabled
                                ? " Activo en el servidor."
                                : " Programador desactivado en servidor."}
                        </p>
                    )}
                    {form.scheduleFrequency === "DAILY" && stats?.autoSchedule && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <FaCalendarAlt />
                            Envío automático: todos los días a las {stats.autoSchedule.hour}:00 (
                            {stats.autoSchedule.timezone})
                            {stats.autoSchedule.daysBeforeExpiry === 5
                                ? " · negocios con plan por vencer en 5 días"
                                : stats.autoSchedule.daysBeforeExpiry === 0
                                  ? " · negocios con plan por vencer hoy"
                                  : ""}
                            .
                            {stats.autoSchedule.enabled
                                ? " Activo en el servidor."
                                : " Programador desactivado en servidor."}
                        </p>
                    )}
                    {form.scheduleFrequency === "MONTHLY" &&
                        !monthlyEligible &&
                        stats?.monthlyEligibility?.reason && (
                        <p className="text-xs text-amber-700 mt-2">{stats.monthlyEligibility.reason}</p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.form
                    onSubmit={handleSave}
                    className="lg:col-span-2 space-y-6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FaInfoCircle className="text-primary" />
                            Información general
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <FieldLabel hint="Nombre interno para identificar la campaña">
                                    Nombre de la campaña
                                </FieldLabel>
                                <input
                                    type="text"
                                    value={form.campaignName}
                                    onChange={(e) => updateField("campaignName", e.target.value)}
                                    disabled={!isEditable}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                                    placeholder="Ej: Bienvenida nuevos usuarios marzo"
                                />
                            </div>
                            <div>
                                <FieldLabel>Descripción (opcional)</FieldLabel>
                                <textarea
                                    value={form.campaignDescription}
                                    onChange={(e) =>
                                        updateField("campaignDescription", e.target.value)
                                    }
                                    disabled={!isEditable}
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                                    placeholder="Contexto o notas para el equipo"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FaUsers className="text-secondary" />
                            Audiencia
                        </h2>
                        <SelectFloatingComponent
                            name="audienceType"
                            label="¿A quién se enviará?"
                            value={form.audienceType}
                            onChange={(e) => updateField("audienceType", e.target.value)}
                            options={audienceOptions}
                            disabled={!isEditable || audienceOptions.length === 0 || isSystemCampaign}
                        />
                        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            {previewLoading ? (
                                "Calculando audiencia…"
                            ) : audiencePreview ? (
                                <>
                                    <strong>{audiencePreview.estimatedRecipients}</strong> destinatarios
                                    estimados
                                    {audiencePreview.audienceDetail?.uniqueEmails != null && (
                                        <span className="block text-xs text-slate-500 mt-1">
                                            {audiencePreview.audienceDetail.uniqueEmails} emails únicos ·{" "}
                                            {audiencePreview.audienceDetail.businesses} negocios
                                        </span>
                                    )}
                                    {audiencePreview.note && (
                                        <span className="block text-xs text-slate-400 mt-1">
                                            {audiencePreview.note}
                                        </span>
                                    )}
                                </>
                            ) : (
                                "Selecciona una audiencia para ver estimación."
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FaEnvelope className="text-primary" />
                            Mensaje del correo
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <FieldLabel>Objetivo / qué quieres transmitir</FieldLabel>
                                <textarea
                                    value={form.messageIntent}
                                    onChange={(e) => updateField("messageIntent", e.target.value)}
                                    disabled={!isEditable}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                                    placeholder="Ej: Invitar a renovar suscripción con beneficio del 10%"
                                />
                            </div>
                            <div>
                                <FieldLabel>Asunto del email</FieldLabel>
                                <input
                                    type="text"
                                    value={form.emailSubject}
                                    onChange={(e) => updateField("emailSubject", e.target.value)}
                                    disabled={!isEditable}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                                    placeholder="Ej: Tu negocio te está esperando en AppsFly"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel
                                        hint={
                                            isSystemCampaign
                                                ? "Asignado por el sistema para distribuir envíos"
                                                : `Solo correos @${metadata?.sender?.domain ?? "appsfly.app"}`
                                        }
                                    >
                                        Nombre remitente
                                    </FieldLabel>
                                    <input
                                        type="text"
                                        value={form.senderName}
                                        onChange={(e) => updateField("senderName", e.target.value)}
                                        disabled={!isEditable || isSystemCampaign}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                                        placeholder="AppsFly"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Correo remitente</FieldLabel>
                                    <input
                                        type="email"
                                        value={form.senderEmail}
                                        onChange={(e) => updateField("senderEmail", e.target.value)}
                                        disabled={!isEditable || isSystemCampaign}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                                        placeholder={`avisos@${metadata?.sender?.domain ?? "appsfly.app"}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <FieldLabel hint="Versión texto plano del correo">
                                    Contenido (texto)
                                </FieldLabel>
                                <textarea
                                    value={form.emailText}
                                    onChange={(e) => updateField("emailText", e.target.value)}
                                    disabled={!isEditable}
                                    rows={6}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                                    placeholder="Texto del mensaje que recibirán los usuarios…"
                                />
                            </div>
                            <div>
                                <FieldLabel hint="Opcional — HTML para diseño avanzado">
                                    Contenido HTML (opcional)
                                </FieldLabel>
                                <textarea
                                    value={form.emailHtml}
                                    onChange={(e) => updateField("emailHtml", e.target.value)}
                                    disabled={!isEditable}
                                    rows={6}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                                    placeholder="<p>Hola {{firstName}}, …</p>"
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Variables: {"{{firstName}}"}, {"{{lastName}}"}, {"{{businessName}}"}, {"{{profileUrl}}"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {isEditable && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className={PRIMARY_BTN}
                            >
                                <FaSave />
                                {saving ? "Guardando…" : isNew ? "Crear campaña" : "Guardar cambios"}
                            </button>
                            <Link to="/admin/email-campaigns" className={SECONDARY_BTN}>
                                Cancelar
                            </Link>
                        </div>
                    )}
                </motion.form>

                <aside className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Modo de envío</h3>
                        <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
                                isAutomatedCampaign(form)
                                    ? SCHEDULE_MODE_STYLES.automated
                                    : SCHEDULE_MODE_STYLES.manual
                            }`}
                        >
                            {scheduleModeLabel(form)}
                        </span>
                        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                            {scheduleDetailLabel(form)}
                        </p>
                        {stats?.autoSchedule?.enabled === false && isAutomatedCampaign(form) && (
                            <p className="text-xs text-amber-700 mt-2">
                                El programador del servidor está desactivado.
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Estado</h3>
                        <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusStyle}`}
                        >
                            {statusLabel(form.campaignStatus)}
                        </span>
                        <p className="text-xs text-slate-400 mt-3">
                            {isAutomatedCampaign(form)
                                ? "También puedes usar «Enviar campaña» para ejecutar manualmente fuera del calendario."
                                : "Guarda y usa «Enviar campaña» cuando estés listo."}
                        </p>
                        {!isSystemCampaign && form.campaignStatus === "DRAFT" && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="mt-4 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                            >
                                <FaTrash /> Eliminar borrador
                            </button>
                        )}
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-medium mb-1">Separado de campañas ASMR</p>
                        <p className="text-amber-800/90 text-xs leading-relaxed">
                            Estas campañas son de plataforma (usuarios AppsFly). Las campañas ASMR
                            del negocio siguen en el panel del tenant bajo{" "}
                            <code className="text-amber-900">/campaigns-asmr</code>.
                        </p>
                    </div>
                </aside>
            </div>
        </PageContainer>
    );
}

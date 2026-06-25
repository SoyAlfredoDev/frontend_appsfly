import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaArrowLeft,
    FaEnvelope,
    FaUsers,
    FaInfoCircle,
    FaBullseye,
    FaCog,
    FaRobot,
    FaHandPaper,
    FaPaperPlane,
    FaSpinner,
    FaExclamationTriangle,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../../components/layout/PageContainer.jsx";
import EmailMessagePreview from "../../../components/admin/EmailMessagePreview.jsx";
import EmailCampaignSubNav from "./EmailCampaignSubNav.jsx";
import {
    getEmailCampaignRequest,
    previewEmailCampaignMessageRequest,
    executeEmailCampaignRequest,
} from "../../../api/adminEmailCampaign.js";
import {
    audienceLabel,
    scheduleModeLabel,
    scheduleDetailLabel,
    scheduleEligibilityLabel,
    buildManualExecuteMessage,
    isAutomatedCampaign,
    SCHEDULE_MODE_STYLES,
    formatCampaignSender,
} from "../../../utils/adminEmailCampaignConstants.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { useConfirm } from "../../../context/ConfirmationContext.jsx";
import { PRIMARY_BTN } from "../../../utils/expenseUiPatterns.js";

const SECONDARY_BTN =
    "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 no-underline";

function MetaBadge({ automated }) {
    const style = automated ? SCHEDULE_MODE_STYLES.automated : SCHEDULE_MODE_STYLES.manual;
    const Icon = automated ? FaRobot : FaHandPaper;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${style}`}
        >
            <Icon className="text-[10px]" />
            {automated ? "Automática" : "Manual"}
        </span>
    );
}

export default function EmailCampaignViewAdminPage() {
    const { id } = useParams();
    const toast = useToast();
    const confirm = useConfirm();

    const [campaign, setCampaign] = useState(null);
    const [messagePreview, setMessagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [campaignRes, previewRes] = await Promise.all([
                getEmailCampaignRequest(id),
                previewEmailCampaignMessageRequest(id),
            ]);
            setCampaign(campaignRes.data);
            setMessagePreview(previewRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Error", "No se pudo cargar la campaña.");
            setCampaign(null);
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSendNow = async () => {
        const ok = await confirm({
            title: "Enviar campaña ahora",
            message: buildManualExecuteMessage(campaign, campaign?.totalRecipients ?? 0),
            variant: "danger",
            confirmText: "Enviar ahora",
            cancelText: "Cancelar",
        });
        if (!ok) return;

        setExecuting(true);
        try {
            const res = await executeEmailCampaignRequest(id);
            const sent = res.data?.run?.sentCount ?? 0;
            toast.success("Campaña enviada", `Se enviaron ${sent} correo(s).`);
            await load();
        } catch (err) {
            toast.error(
                "No se pudo enviar",
                err.response?.data?.message ?? "Error al ejecutar la campaña.",
            );
        } finally {
            setExecuting(false);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="py-20 text-center text-slate-400">Cargando campaña…</div>
            </PageContainer>
        );
    }

    if (!campaign) {
        return (
            <PageContainer>
                <div className="py-20 text-center">
                    <p className="text-slate-600">Campaña no encontrada.</p>
                    <Link to="/admin/email-campaigns" className={`${SECONDARY_BTN} mt-4 inline-flex`}>
                        Volver al catálogo
                    </Link>
                </div>
            </PageContainer>
        );
    }

    const automated = isAutomatedCampaign(campaign);
    const dueLabel = scheduleEligibilityLabel(campaign.scheduleEligibility);
    const isDue = campaign.scheduleEligibility?.due;

    return (
        <PageContainer>
            <div className="mb-4">
                <Link
                    to="/admin/email-campaigns"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 no-underline"
                >
                    <FaArrowLeft /> Catálogo de campañas
                </Link>
            </div>

            {isDue && dueLabel && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
                    <FaExclamationTriangle className="shrink-0 mt-0.5" />
                    <span>{dueLabel}</span>
                </div>
            )}

            <PageHeader
                title={campaign.campaignName}
                subtitle={
                    campaign.campaignDescription ||
                    "Vista del mensaje y configuración de la campaña."
                }
                actions={
                    <div className="flex flex-wrap gap-2">
                        {isDue && (
                            <button
                                type="button"
                                onClick={handleSendNow}
                                disabled={executing}
                                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                            >
                                {executing ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                {executing ? "Enviando…" : "Enviar ahora"}
                            </button>
                        )}
                        <Link to={`/admin/email-campaigns/${id}/settings`} className={PRIMARY_BTN}>
                            <FaCog /> Configurar y enviar
                        </Link>
                    </div>
                }
            />

            <EmailCampaignSubNav />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.aside
                    className="lg:col-span-1 space-y-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <FaEnvelope className="text-primary" />
                            Resumen
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <MetaBadge automated={automated} />
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Audiencia
                                </dt>
                                <dd className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                                    <FaUsers className="text-slate-400 text-xs shrink-0" />
                                    {audienceLabel(campaign.audienceType)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Programación
                                </dt>
                                <dd className="text-slate-700 mt-0.5 leading-relaxed">
                                    {scheduleDetailLabel(campaign)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Modo
                                </dt>
                                <dd className="text-slate-700 mt-0.5">
                                    {scheduleModeLabel(campaign)}
                                </dd>
                            </div>
                            {campaign.emailSubject && (
                                <div>
                                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Asunto del correo
                                    </dt>
                                    <dd className="text-slate-800 mt-0.5 font-medium">
                                        {campaign.emailSubject}
                                    </dd>
                                </div>
                            )}
                            {formatCampaignSender(campaign) && (
                                <div>
                                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Enviado desde
                                    </dt>
                                    <dd className="text-slate-700 mt-0.5 font-mono text-xs">
                                        {formatCampaignSender(campaign)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    {campaign.messageIntent && (
                        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                <FaBullseye className="text-secondary" />
                                Objetivo del mensaje
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {campaign.messageIntent}
                            </p>
                        </section>
                    )}

                    {campaign.campaignDescription && (
                        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                            <h2 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                                <FaInfoCircle />
                                ¿De qué trata?
                            </h2>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {campaign.campaignDescription}
                            </p>
                        </section>
                    )}
                </motion.aside>

                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    {messagePreview?.senderFrom && (
                        <p className="text-xs text-slate-500 mb-3">
                            Remitente de envío:{" "}
                            <span className="font-mono text-slate-600">{messagePreview.senderFrom}</span>
                        </p>
                    )}
                    <EmailMessagePreview
                        html={messagePreview?.html}
                        subject={messagePreview?.subject}
                    />
                    {messagePreview?.sampleRecipient && (
                        <p className="text-xs text-slate-400 mt-3">
                            Vista previa con datos de ejemplo:{" "}
                            {messagePreview.sampleRecipient.firstName} ·{" "}
                            {messagePreview.sampleRecipient.businessName}
                            {messagePreview.sampleRecipient.planName &&
                                ` · ${messagePreview.sampleRecipient.planName}`}
                        </p>
                    )}
                </motion.div>
            </div>
        </PageContainer>
    );
}

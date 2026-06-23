import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaArrowLeft,
    FaUsers,
    FaPaperPlane,
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaEyeSlash,
    FaCog,
    FaCalendarAlt,
    FaMousePointer,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../../components/layout/PageContainer.jsx";
import KpiComponent from "../../../components/KpiComponent.jsx";
import EmailCampaignSubNav from "./EmailCampaignSubNav.jsx";
import {
    getEmailCampaignRequest,
    getEmailCampaignStatsRequest,
} from "../../../api/adminEmailCampaign.js";
import {
    audienceLabel,
    scheduleDetailLabel,
    isAutomatedCampaign,
} from "../../../utils/adminEmailCampaignConstants.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { PRIMARY_BTN } from "../../../utils/expenseUiPatterns.js";

const SECONDARY_BTN =
    "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 no-underline";

export default function EmailCampaignHistoryDetailAdminPage() {
    const { id } = useParams();
    const toast = useToast();

    const [campaign, setCampaign] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [campaignRes, statsRes] = await Promise.all([
                getEmailCampaignRequest(id),
                getEmailCampaignStatsRequest(id),
            ]);
            setCampaign(campaignRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Error", "No se pudo cargar el historial de la campaña.");
            setCampaign(null);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <PageContainer>
                <div className="py-20 text-center text-slate-400">Cargando resultados…</div>
            </PageContainer>
        );
    }

    if (!campaign) {
        return (
            <PageContainer>
                <div className="py-20 text-center">
                    <p className="text-slate-600">Campaña no encontrada.</p>
                    <Link to="/admin/email-campaigns/history" className={`${SECONDARY_BTN} mt-4 inline-flex`}>
                        Volver al historial
                    </Link>
                </div>
            </PageContainer>
        );
    }

    const totals = stats?.totals ?? {
        recipients: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
        rejected: 0,
        opened: 0,
        clicked: 0,
        notOpened: 0,
    };
    const runs = stats?.runs ?? [];

    return (
        <PageContainer>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link
                    to="/admin/email-campaigns/history"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 no-underline"
                >
                    <FaArrowLeft /> Historial de envíos
                </Link>
                <Link
                    to={`/admin/email-campaigns/${id}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 no-underline"
                >
                    <FaEye /> Ver campaña
                </Link>
            </div>

            <PageHeader
                title={`Resultados — ${campaign.campaignName}`}
                subtitle={`${audienceLabel(campaign.audienceType)} · ${scheduleDetailLabel(campaign)}`}
                actions={
                    <Link to={`/admin/email-campaigns/${id}/settings`} className={PRIMARY_BTN}>
                        <FaCog /> Configurar y enviar
                    </Link>
                }
            />

            <EmailCampaignSubNav />

            {isAutomatedCampaign(campaign) && stats?.autoSchedule && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 flex items-start gap-2">
                    <FaCalendarAlt className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-slate-800">Programación automática</p>
                        <p className="mt-0.5">
                            {scheduleDetailLabel(campaign)}.
                            {stats.autoSchedule.enabled
                                ? " Activo en el servidor."
                                : " Programador desactivado en servidor."}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
                <KpiComponent
                    title="Destinatarios (acum.)"
                    value={totals.recipients}
                    icon={FaUsers}
                    footer="Correos objetivo históricos"
                />
                <KpiComponent
                    title="Enviados"
                    value={totals.sent}
                    icon={FaPaperPlane}
                    footer="Aceptados por Resend"
                />
                <KpiComponent
                    title="Entregados"
                    value={totals.delivered}
                    icon={FaCheckCircle}
                    footer="Confirmados por webhook"
                />
                <KpiComponent
                    title="Rechazados"
                    value={totals.rejected ?? totals.failed + (totals.bounced ?? 0)}
                    icon={FaTimesCircle}
                    footer="Fallidos + rebotes"
                />
                <KpiComponent
                    title="Leídos"
                    value={totals.opened}
                    icon={FaEye}
                    footer="Aperturas registradas"
                />
                <KpiComponent
                    title="Clics registro"
                    value={totals.clicked ?? 0}
                    icon={FaMousePointer}
                    footer="Clic en enlace de alta"
                />
                <KpiComponent
                    title="Sin leer"
                    value={totals.notOpened}
                    icon={FaEyeSlash}
                    footer="Entregados sin apertura"
                />
            </div>

            <motion.section
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-base font-semibold text-slate-800 mb-4">
                    Historial de envíos
                </h2>

                {runs.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-400">
                        Esta campaña aún no tiene envíos registrados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-gray-100">
                                    <th className="py-2 pr-4 font-medium">Fecha</th>
                                    <th className="py-2 pr-4 font-medium">Destinatarios</th>
                                    <th className="py-2 pr-4 font-medium">Enviados</th>
                                    <th className="py-2 pr-4 font-medium">Entregados</th>
                                    <th className="py-2 pr-4 font-medium">Rechazados</th>
                                    <th className="py-2 pr-4 font-medium">Leídos</th>
                                    <th className="py-2 pr-4 font-medium">Clics</th>
                                    <th className="py-2 font-medium">Sin leer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {runs.map((run) => {
                                    const rejected =
                                        (run.failedCount ?? 0) + (run.bouncedCount ?? 0);
                                    const notOpened = Math.max(
                                        0,
                                        (run.deliveredCount ?? 0) - (run.openedCount ?? 0),
                                    );
                                    return (
                                    <tr key={run.runId} className="border-b border-gray-50">
                                        <td className="py-3 pr-4 text-slate-600">
                                            {run.completedAt
                                                ? new Date(run.completedAt).toLocaleString("es-CL")
                                                : run.startedAt
                                                  ? new Date(run.startedAt).toLocaleString("es-CL")
                                                  : "—"}
                                        </td>
                                        <td className="py-3 pr-4">{run.recipientCount}</td>
                                        <td className="py-3 pr-4">{run.sentCount}</td>
                                        <td className="py-3 pr-4 text-primary font-medium">
                                            {run.deliveredCount ?? 0}
                                        </td>
                                        <td className="py-3 pr-4 text-red-600">{rejected}</td>
                                        <td className="py-3 pr-4">{run.openedCount ?? 0}</td>
                                        <td className="py-3 pr-4 text-emerald-700 font-medium">
                                            {run.clickedCount ?? 0}
                                        </td>
                                        <td className="py-3 text-slate-500">{notOpened}</td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.section>
        </PageContainer>
    );
}

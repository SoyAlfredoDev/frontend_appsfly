import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaEnvelope,
    FaSearch,
    FaPaperPlane,
    FaEdit,
    FaClock,
    FaCheckCircle,
    FaRobot,
    FaHandPaper,
    FaChartBar,
    FaTimesCircle,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../../components/layout/PageContainer.jsx";
import KpiComponent from "../../../components/KpiComponent.jsx";
import EmailCampaignSubNav from "./EmailCampaignSubNav.jsx";
import { getEmailCampaignsRequest } from "../../../api/adminEmailCampaign.js";
import {
    audienceLabel,
    statusLabel,
    EMAIL_CAMPAIGN_STATUS_STYLES,
    scheduleModeLabel,
    scheduleDetailLabel,
    isAutomatedCampaign,
    SCHEDULE_MODE_STYLES,
} from "../../../utils/adminEmailCampaignConstants.js";
import {
    TABLE_WRAPPER,
    TABLE_TOOLBAR,
    THEAD,
    TH,
    TBODY,
    TD,
    TR_ROW,
    formatRecordCount,
} from "../../../utils/expenseUiPatterns.js";
import formatDate from "../../../utils/formatDate.js";

function StatusBadge({ status }) {
    const style = EMAIL_CAMPAIGN_STATUS_STYLES[status] ?? EMAIL_CAMPAIGN_STATUS_STYLES.DRAFT;
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
            {statusLabel(status)}
        </span>
    );
}

function ScheduleBadge({ campaign }) {
    const automated = isAutomatedCampaign(campaign);
    const style = automated ? SCHEDULE_MODE_STYLES.automated : SCHEDULE_MODE_STYLES.manual;
    const Icon = automated ? FaRobot : FaHandPaper;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
            <Icon className="text-[10px]" />
            {scheduleModeLabel(campaign)}
        </span>
    );
}

export default function EmailCampaignHistoryAdminPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const loadCampaigns = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getEmailCampaignsRequest();
            setCampaigns(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar las campañas.");
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return campaigns;
        return campaigns.filter((c) => {
            const haystack = [
                c.campaignName,
                c.campaignDescription,
                c.emailSubject,
                audienceLabel(c.audienceType),
                statusLabel(c.campaignStatus),
                scheduleModeLabel(c),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [campaigns, searchQuery]);

    const kpis = useMemo(() => {
        const draft = campaigns.filter((c) => c.campaignStatus === "DRAFT").length;
        const scheduled = campaigns.filter((c) => c.campaignStatus === "SCHEDULED").length;
        const sent = campaigns.filter((c) => c.campaignStatus === "SENT").length;
        const automated = campaigns.filter((c) => isAutomatedCampaign(c)).length;
        const totalSent = campaigns.reduce((sum, c) => sum + (c.totalSent ?? 0), 0);
        const totalDelivered = campaigns.reduce((sum, c) => sum + (c.totalDelivered ?? 0), 0);
        const totalFailed = campaigns.reduce((sum, c) => sum + (c.totalFailed ?? 0), 0);
        const totalBounced = campaigns.reduce((sum, c) => sum + (c.totalBounced ?? 0), 0);
        const totalOpened = campaigns.reduce((sum, c) => sum + (c.totalOpened ?? 0), 0);
        const totalRejected = totalFailed + totalBounced;
        const totalNotOpened = Math.max(0, totalDelivered - totalOpened);
        return {
            total: campaigns.length,
            draft,
            scheduled,
            sent,
            automated,
            totalSent,
            totalDelivered,
            totalFailed,
            totalBounced,
            totalRejected,
            totalOpened,
            totalNotOpened,
        };
    }, [campaigns]);

    return (
        <PageContainer>
            <PageHeader
                title="Campañas de email"
                subtitle="Resultados de envíos, métricas acumuladas e historial por campaña."
            />

            <EmailCampaignSubNav />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                <KpiComponent
                    title="Correos enviados"
                    value={kpis.totalSent}
                    icon={FaPaperPlane}
                    footer="Aceptados por Resend"
                />
                <KpiComponent
                    title="Entregados"
                    value={kpis.totalDelivered}
                    icon={FaCheckCircle}
                    footer="Confirmados por el proveedor"
                />
                <KpiComponent
                    title="Rechazados"
                    value={kpis.totalRejected}
                    icon={FaTimesCircle}
                    footer="Fallidos al enviar + rebotes"
                />
                <KpiComponent
                    title="Leídos"
                    value={kpis.totalOpened}
                    icon={FaEye}
                    footer="Aperturas registradas"
                />
                <KpiComponent
                    title="Sin leer"
                    value={kpis.totalNotOpened}
                    icon={FaEyeSlash}
                    footer="Entregados sin apertura"
                />
                <KpiComponent
                    title="Total campañas"
                    value={kpis.total}
                    icon={FaEnvelope}
                    footer="Registradas"
                />
                <KpiComponent
                    title="Automatizadas"
                    value={kpis.automated}
                    icon={FaRobot}
                    footer="Programadas en servidor"
                />
            </div>

            <div className={TABLE_WRAPPER}>
                <div className={TABLE_TOOLBAR}>
                    <div className="relative flex-1 max-w-md">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre, audiencia, estado…"
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <span className="text-sm text-slate-500">
                        {formatRecordCount(filtered.length, "campaña", "campañas")}
                    </span>
                </div>

                {error && (
                    <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[960px]">
                        <thead className={THEAD}>
                            <tr>
                                <th className={TH}>Campaña</th>
                                <th className={TH}>Modo</th>
                                <th className={TH}>Audiencia</th>
                                <th className={TH}>Estado</th>
                                <th className={TH}>Enviados</th>
                                <th className={TH}>Entregados</th>
                                <th className={TH}>Rechazados</th>
                                <th className={TH}>Leídos</th>
                                <th className={TH}>Sin leer</th>
                                <th className={TH}>Último envío</th>
                                <th className={TH} />
                            </tr>
                        </thead>
                        <tbody className={TBODY}>
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className={`${TD} text-center text-slate-400 py-10`}>
                                        Cargando historial…
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className={`${TD} text-center py-12`}>
                                        <FaChartBar className="mx-auto mb-3 text-3xl text-slate-300" />
                                        <p className="text-slate-600 font-medium">Sin campañas</p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Aún no hay datos de envío registrados.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((campaign) => (
                                    <motion.tr
                                        key={campaign.campaignId}
                                        className={TR_ROW}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td className={TD}>
                                            <Link
                                                to={`/admin/email-campaigns/${campaign.campaignId}/history`}
                                                className="font-medium text-secondary hover:text-secondary/80 no-underline"
                                            >
                                                {campaign.campaignName}
                                            </Link>
                                            {campaign.emailSubject && (
                                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                                    {campaign.emailSubject}
                                                </p>
                                            )}
                                        </td>
                                        <td className={TD}>
                                            <ScheduleBadge campaign={campaign} />
                                        </td>
                                        <td className={TD}>
                                            <span className="text-sm text-slate-700">
                                                {audienceLabel(campaign.audienceType)}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <StatusBadge status={campaign.campaignStatus} />
                                        </td>
                                        <td className={TD}>
                                            <span className="text-sm text-slate-700">
                                                {campaign.totalSent ?? 0}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <span className="text-sm text-primary font-medium">
                                                {campaign.totalDelivered ?? 0}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <span className="text-sm text-red-600">
                                                {(campaign.totalFailed ?? 0) + (campaign.totalBounced ?? 0)}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <span className="text-sm text-slate-700">
                                                {campaign.totalOpened ?? 0}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <span className="text-sm text-slate-500">
                                                {Math.max(
                                                    0,
                                                    (campaign.totalDelivered ?? 0) -
                                                        (campaign.totalOpened ?? 0),
                                                )}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <span className="text-sm text-slate-500">
                                                {campaign.lastRunAt
                                                    ? formatDate(campaign.lastRunAt)
                                                    : "—"}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <Link
                                                to={`/admin/email-campaigns/${campaign.campaignId}/history`}
                                                className="text-sm font-medium text-primary hover:text-primary/80 no-underline"
                                            >
                                                Ver resultados
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageContainer>
    );
}

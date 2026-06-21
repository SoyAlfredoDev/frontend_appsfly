import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaEnvelope,
    FaPlus,
    FaSearch,
    FaUsers,
    FaEye,
    FaCog,
    FaRobot,
    FaHandPaper,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../../components/layout/PageContainer.jsx";
import EmailCampaignSubNav from "./EmailCampaignSubNav.jsx";
import { getEmailCampaignsRequest, ensureSystemEmailCampaignsRequest } from "../../../api/adminEmailCampaign.js";
import {
    audienceLabel,
    scheduleModeLabel,
    scheduleDetailLabel,
    isAutomatedCampaign,
    SCHEDULE_MODE_STYLES,
    formatCampaignSender,
} from "../../../utils/adminEmailCampaignConstants.js";
import { PRIMARY_BTN, formatRecordCount } from "../../../utils/expenseUiPatterns.js";

function ScheduleBadge({ campaign }) {
    const automated = isAutomatedCampaign(campaign);
    const style = automated ? SCHEDULE_MODE_STYLES.automated : SCHEDULE_MODE_STYLES.manual;
    const Icon = automated ? FaRobot : FaHandPaper;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
        >
            <Icon className="text-[10px]" />
            {scheduleModeLabel(campaign)}
        </span>
    );
}

function CampaignCard({ campaign }) {
    return (
        <motion.article
            className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        {campaign.campaignKey && (
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate">
                                Sistema
                            </p>
                        )}
                        <h3 className="font-display text-lg font-bold text-dark leading-snug">
                            {campaign.campaignName}
                        </h3>
                    </div>
                    <ScheduleBadge campaign={campaign} />
                </div>

                {campaign.campaignDescription && (
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {campaign.campaignDescription}
                    </p>
                )}

                {campaign.messageIntent && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 border-l-2 border-secondary/30 pl-3">
                        {campaign.messageIntent}
                    </p>
                )}

                <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                        <FaUsers className="text-slate-400 shrink-0 mt-0.5" />
                        <span>{audienceLabel(campaign.audienceType)}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        {scheduleDetailLabel(campaign)}
                    </p>
                </div>

                {campaign.emailSubject && (
                    <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 mt-auto">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
                            Asunto
                        </p>
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">
                            {campaign.emailSubject}
                        </p>
                    </div>
                )}

                {formatCampaignSender(campaign) && (
                    <p className="text-xs text-slate-500 font-mono truncate">
                        Desde: {formatCampaignSender(campaign)}
                    </p>
                )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-slate-50/60 flex flex-wrap gap-2">
                <Link
                    to={`/admin/email-campaigns/${campaign.campaignId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-primary/20 bg-white text-primary hover:bg-primary/5 transition-colors no-underline"
                >
                    <FaEye />
                    Ver campaña
                </Link>
                <Link
                    to={`/admin/email-campaigns/${campaign.campaignId}/settings`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors no-underline"
                >
                    <FaCog />
                    Configurar
                </Link>
            </div>
        </motion.article>
    );
}

export default function EmailCampaignsAdminPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const loadCampaigns = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await ensureSystemEmailCampaignsRequest();
            const res = await getEmailCampaignsRequest();
            setCampaigns(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar las campañas de email.");
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
                c.messageIntent,
                audienceLabel(c.audienceType),
                scheduleModeLabel(c),
                scheduleDetailLabel(c),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [campaigns, searchQuery]);

    return (
        <PageContainer>
            <PageHeader
                title="Campañas de email"
                subtitle="Catálogo de correos de plataforma. Abre cada campaña para ver el mensaje completo."
                actions={
                    <Link to="/admin/email-campaigns/new" className={PRIMARY_BTN}>
                        <FaPlus /> Nueva campaña
                    </Link>
                }
            />

            <EmailCampaignSubNav />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre, audiencia, asunto…"
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <span className="text-sm text-slate-500">
                    {formatRecordCount(filtered.length, "campaña", "campañas")}
                </span>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="h-72 rounded-xl border border-gray-200 bg-white animate-pulse"
                        />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                    <FaEnvelope className="mx-auto mb-3 text-3xl text-slate-300" />
                    <p className="text-slate-600 font-medium">Sin campañas de email</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                        Crea una campaña para definir audiencia, mensaje y parámetros de envío.
                    </p>
                    <Link
                        to="/admin/email-campaigns/new"
                        className={`${PRIMARY_BTN} mt-4 inline-flex`}
                    >
                        <FaPlus /> Crear primera campaña
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((campaign) => (
                        <CampaignCard key={campaign.campaignId} campaign={campaign} />
                    ))}
                </div>
            )}
        </PageContainer>
    );
}

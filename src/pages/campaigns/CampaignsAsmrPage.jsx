import { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
    FaBullhorn,
    FaPaperPlane,
    FaUserClock,
    FaInbox,
    FaPlus,
    FaSearch,
    FaEye,
} from "react-icons/fa";
import PageContainer from "../../components/layout/PageContainer.jsx";
import SectionHeader from "../../components/SetionHeader.jsx";
import KpiComponent from "../../components/KpiComponent.jsx";
import CreateAsmrCampaignModal from "../../components/modals/CreateAsmrCampaignModal.jsx";
import { getAsmrCampaigns, getAsmrCampaignSummary } from "../../api/asmrCampaign.js";
import formatDate from "../../utils/formatDate.js";
import { ASMR_CAMPAIGN_TYPES } from "../../utils/asmrCampaignConstants.js";
import { formatMonthYearLabel } from "../../utils/monthOptions.js";

const CREATE_BTN =
    "flex items-center gap-2 px-4 py-2 bg-[#01c676] text-white rounded-lg hover:bg-[#01a866] transition-colors shadow-sm text-sm font-semibold";

function campaignTypeLabel(type) {
    return ASMR_CAMPAIGN_TYPES.find((t) => t.value === type)?.label ?? type;
}

export default function CampaignsAsmrPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [viewCampaign, setViewCampaign] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [listRes, summaryRes] = await Promise.all([
                getAsmrCampaigns(),
                getAsmrCampaignSummary(),
            ]);
            setCampaigns(Array.isArray(listRes.data) ? listRes.data : []);
            setSummary(summaryRes.data ?? null);
        } catch (error) {
            console.error("Error loading ASMR campaigns:", error);
            setCampaigns([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return campaigns;
        return campaigns.filter((c) => {
            const haystack = [
                c.campaignName,
                c.messageSent,
                campaignTypeLabel(c.campaignType),
                formatMonthYearLabel(c.auditMonth, c.auditYear),
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [campaigns, searchQuery]);

    return (
        <PageContainer>
            <div className="space-y-6">
                <SectionHeader
                    title="Campaña ASMR"
                    subtitle="Gestión y automatización de campañas de fidelización vía WhatsApp"
                    actions={
                        <button type="button" className={CREATE_BTN} onClick={() => setModalOpen(true)}>
                            <FaPlus /> Crear Campaña
                        </button>
                    }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <KpiComponent
                        title="Campañas Activas"
                        icon={<FaBullhorn />}
                        value={loading ? null : (summary?.activeCampaigns ?? 0)}
                        footer="Campañas ejecutadas"
                        isCurrency={false}
                        loading={loading}
                    />
                    <KpiComponent
                        title="Mensajes Enviados este Mes"
                        icon={<FaPaperPlane />}
                        value={loading ? null : (summary?.messagesThisMonth ?? 0)}
                        footer="Contactos alcanzados en el mes"
                        isCurrency={false}
                        loading={loading}
                    />
                    <KpiComponent
                        title="Clientes por Contactar"
                        icon={<FaUserClock />}
                        value={loading ? null : (summary?.clientsToContact ?? 0)}
                        footer="Última segmentación apta"
                        isCurrency={false}
                        loading={loading}
                    />
                </div>

                <Motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 font-sans">
                                Campañas ejecutadas
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5 font-sans">
                                {loading
                                    ? "Cargando..."
                                    : `${filtered.length} registro${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar campaña, mensaje..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm font-sans"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Fecha ejecución</th>
                                    <th className="px-6 py-4">Nombre campaña</th>
                                    <th className="px-6 py-4">Periodo auditado</th>
                                    <th className="px-6 py-4">Mensaje enviado</th>
                                    <th className="px-6 py-4">Contactos éxito</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
                                                <p className="text-gray-500 text-sm">
                                                    Cargando campañas...
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-500">
                                                <FaInbox className="text-4xl text-gray-300" />
                                                <p className="text-sm font-medium font-sans max-w-lg leading-relaxed">
                                                    No hay campañas ejecutadas. Próximamente podrás
                                                    segmentar a tus clientes de óptica que cumplieron
                                                    un año desde su última compra.
                                                </p>
                                                <button
                                                    type="button"
                                                    className={`${CREATE_BTN} mt-2`}
                                                    onClick={() => setModalOpen(true)}
                                                >
                                                    <FaPlus /> Crear Campaña
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((campaign) => (
                                        <tr
                                            key={campaign.campaignId}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                                {formatDate(campaign.executedAt || campaign.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-800 text-sm font-medium">
                                                {campaign.campaignName}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                                {formatMonthYearLabel(
                                                    campaign.auditMonth,
                                                    campaign.auditYear,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                                                {campaign.messageSent ?? "—"}
                                            </td>
                                            <td className="px-6 py-4 text-primary font-semibold text-sm">
                                                {campaign.contactsSuccess ?? 0}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    type="button"
                                                    title="Ver detalle"
                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                    onClick={() => setViewCampaign(campaign)}
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Motion.section>
            </div>

            <CreateAsmrCampaignModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCompleted={fetchData}
            />

            {viewCampaign && (
                <CampaignDetailModal
                    campaign={viewCampaign}
                    onClose={() => setViewCampaign(null)}
                />
            )}
        </PageContainer>
    );
}

function CampaignDetailModal({ campaign, onClose }) {
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-[#021f41] font-display">
                    {campaign.campaignName}
                </h3>
                <dl className="grid grid-cols-1 gap-2 text-sm font-sans">
                    <Detail label="Tipo" value={campaignTypeLabel(campaign.campaignType)} />
                    <Detail
                        label="Periodo auditado"
                        value={formatMonthYearLabel(campaign.auditMonth, campaign.auditYear)}
                    />
                    <Detail
                        label="Origen analizado"
                        value={formatMonthYearLabel(campaign.sourceMonth, campaign.sourceYear)}
                    />
                    <Detail label="Descuento" value={`${campaign.discountPercent}%`} />
                    <Detail label="Universo total" value={campaign.universeTotal} />
                    <Detail label="Excluidos por recompra" value={campaign.excludedRepurchase} />
                    <Detail label="Aptos finales" value={campaign.eligibleFinal} />
                    <Detail label="Teléfonos deduplicados" value={campaign.phonesDeduplicated} />
                    <Detail label="Contactos éxito" value={campaign.contactsSuccess} />
                    <Detail label="Mensaje" value={campaign.messageSent ?? "—"} />
                    <Detail
                        label="Ejecutada"
                        value={formatDate(campaign.executedAt || campaign.createdAt)}
                    />
                </dl>
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div className="flex justify-between gap-4 py-1 border-b border-gray-50">
            <dt className="text-gray-500">{label}</dt>
            <dd className="text-gray-900 text-right font-medium">{value}</dd>
        </div>
    );
}

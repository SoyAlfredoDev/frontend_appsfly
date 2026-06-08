import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
    FaTimes,
    FaSearch,
    FaWhatsapp,
    FaUsers,
    FaUserMinus,
    FaUserCheck,
    FaPhoneSlash,
} from "react-icons/fa";
import InputFloatingComponent from "../inputs/InputFloatingComponent.jsx";
import SelectFloatingComponent from "../inputs/SelectFloatingComponent.jsx";
import { segmentAsmrCampaign, executeAsmrCampaign } from "../../api/asmrCampaign.js";
import { useToast } from "../../context/ToastContext.jsx";
import {
    generateMonthOptions,
    getCurrentMonthYear,
    toMonthYearKey,
    parseMonthYearKey,
    formatMonthYearLabel,
} from "../../utils/monthOptions.js";
import {
    ASMR_CAMPAIGN_TYPES,
    DEFAULT_CAMPAIGN_NAME,
    DEFAULT_DISCOUNT_PERCENT,
    WHATSAPP_SUCCESS_TOAST,
    BREAKDOWN_LABELS,
} from "../../utils/asmrCampaignConstants.js";

const PRIMARY_GREEN_BTN =
    "flex items-center justify-center gap-2 px-5 py-2.5 bg-[#01c676] text-white rounded-lg hover:bg-[#01a866] transition-colors text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

const CANCEL_BTN =
    "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium";

export default function CreateAsmrCampaignModal({ isOpen, onClose, onCompleted }) {
    const toast = useToast();
    const monthOptions = useMemo(() => generateMonthOptions(24), []);
    const currentPeriod = getCurrentMonthYear();
    const defaultPeriod = toMonthYearKey(currentPeriod.month, currentPeriod.year);

    const [step, setStep] = useState("config");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [segmentation, setSegmentation] = useState(null);

    const [form, setForm] = useState({
        campaignName: DEFAULT_CAMPAIGN_NAME,
        campaignType: ASMR_CAMPAIGN_TYPES[0].value,
        discountPercent: DEFAULT_DISCOUNT_PERCENT,
        auditPeriod: defaultPeriod,
    });

    useEffect(() => {
        if (!isOpen) return;
        setStep("config");
        setSegmentation(null);
        setLoading(false);
        setSending(false);
        setForm({
            campaignName: DEFAULT_CAMPAIGN_NAME,
            campaignType: ASMR_CAMPAIGN_TYPES[0].value,
            discountPercent: DEFAULT_DISCOUNT_PERCENT,
            auditPeriod: defaultPeriod,
        });
    }, [isOpen, defaultPeriod]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSegment = async () => {
        const { month, year } = parseMonthYearKey(form.auditPeriod);
        setLoading(true);
        try {
            const res = await segmentAsmrCampaign({
                campaignName: form.campaignName.trim(),
                campaignType: form.campaignType,
                auditMonth: month,
                auditYear: year,
                discountPercent: Number(form.discountPercent),
            });
            setSegmentation(res.data);
            setStep("results");
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo procesar la segmentación.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        if (!segmentation) return;
        const { month, year } = parseMonthYearKey(form.auditPeriod);
        setSending(true);
        try {
            const res = await executeAsmrCampaign({
                campaignName: form.campaignName.trim(),
                campaignType: form.campaignType,
                auditMonth: month,
                auditYear: year,
                discountPercent: Number(form.discountPercent),
            });
            toast.success("Campaña enviada", res.data?.message || WHATSAPP_SUCCESS_TOAST);
            onCompleted?.();
            onClose?.();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo enviar la campaña.",
            );
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    const { month, year } = parseMonthYearKey(form.auditPeriod);
    const auditLabel = formatMonthYearLabel(month, year);
    const breakdown = segmentation?.breakdown;
    const sourceLabel = segmentation?.sourcePeriodLabel ?? "—";

    const modalContent = (
        <AnimatePresence>
            <Motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <Motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-lg font-semibold text-[#021f41] font-display">
                                {step === "config" ? "Crear campaña" : "Resultados de segmentación"}
                            </h2>
                            <p className="text-xs text-gray-500 font-sans mt-0.5">
                                {step === "config"
                                    ? "Configura los parámetros de la campaña ASMR"
                                    : `Auditoría: ${auditLabel} · Origen: ${sourceLabel}`}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 space-y-5">
                        <AnimatePresence mode="wait">
                            {step === "config" ? (
                                <Motion.div
                                    key="config"
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    className="space-y-1"
                                >
                                    <InputFloatingComponent
                                        label="Nombre de la campaña"
                                        name="campaignName"
                                        value={form.campaignName}
                                        onChange={handleChange}
                                    />
                                    <SelectFloatingComponent
                                        label="Tipo de campaña"
                                        name="campaignType"
                                        value={form.campaignType}
                                        onChange={handleChange}
                                        options={ASMR_CAMPAIGN_TYPES.map((t) => ({
                                            value: t.value,
                                            label: t.label,
                                        }))}
                                        disabled
                                    />
                                    <InputFloatingComponent
                                        label="Descuento (%)"
                                        name="discountPercent"
                                        type="number"
                                        value={form.discountPercent}
                                        onChange={handleChange}
                                        disabled
                                    />
                                    <SelectFloatingComponent
                                        label="Mes / Año a auditar"
                                        name="auditPeriod"
                                        value={form.auditPeriod}
                                        onChange={handleChange}
                                        options={monthOptions.map((opt) => ({
                                            value: opt.value,
                                            label:
                                                opt.label +
                                                (opt.value === defaultPeriod ? " (actual)" : ""),
                                        }))}
                                    />
                                    <p className="text-xs text-gray-500 font-sans pt-1 leading-relaxed">
                                        Se analizarán compradores de{" "}
                                        <span className="font-medium text-gray-700">
                                            {formatMonthYearLabel(month, year - 1)}
                                        </span>{" "}
                                        y se excluirán quienes recompraron hasta{" "}
                                        <span className="font-medium text-gray-700">{auditLabel}</span>.
                                    </p>
                                </Motion.div>
                            ) : (
                                <Motion.div
                                    key="results"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <BreakdownCard
                                            icon={<FaUsers className="text-primary" />}
                                            label={BREAKDOWN_LABELS.universeTotal(sourceLabel)}
                                            value={breakdown?.universeTotal ?? 0}
                                        />
                                        <BreakdownCard
                                            icon={<FaUserMinus className="text-amber-500" />}
                                            label={BREAKDOWN_LABELS.excludedRepurchase}
                                            value={breakdown?.excludedRepurchase ?? 0}
                                        />
                                        <BreakdownCard
                                            icon={<FaUserCheck className="text-emerald-600" />}
                                            label={BREAKDOWN_LABELS.eligibleFinal}
                                            value={breakdown?.eligibleFinal ?? 0}
                                            highlight
                                        />
                                        <BreakdownCard
                                            icon={<FaPhoneSlash className="text-red-500" />}
                                            label={BREAKDOWN_LABELS.phonesDeduplicated}
                                            value={breakdown?.phonesDeduplicated ?? 0}
                                        />
                                    </div>

                                    {(breakdown?.eligibleFinal ?? 0) === 0 && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                            No hay contactos aptos con los filtros actuales. Ajusta
                                            el mes o verifica ventas del periodo origen.
                                        </div>
                                    )}
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-end gap-3 shrink-0">
                        {step === "results" && (
                            <button
                                type="button"
                                className={CANCEL_BTN}
                                onClick={() => setStep("config")}
                                disabled={sending}
                            >
                                Volver
                            </button>
                        )}
                        <button type="button" onClick={onClose} disabled={loading || sending} className={CANCEL_BTN}>
                            Cancelar
                        </button>
                        {step === "config" ? (
                            <button
                                type="button"
                                onClick={handleSegment}
                                disabled={loading}
                                className={PRIMARY_GREEN_BTN}
                            >
                                <FaSearch />
                                {loading ? "Procesando..." : "Procesar segmentación"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleExecute}
                                disabled={sending || (breakdown?.eligibleFinal ?? 0) === 0}
                                className={PRIMARY_GREEN_BTN}
                            >
                                <FaWhatsapp />
                                {sending ? "Enviando..." : "Enviar Campaña vía WhatsApp"}
                            </button>
                        )}
                    </div>
                </Motion.div>
            </Motion.div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}

function BreakdownCard({ icon, label, value, highlight = false }) {
    return (
        <div
            className={`rounded-xl border p-4 bg-white ${
                highlight ? "border-emerald-200 ring-1 ring-emerald-100" : "border-gray-200"
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-50 shrink-0">{icon}</div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-sans leading-snug">{label}</p>
                    <p
                        className={`text-2xl font-bold mt-1 tabular-nums ${
                            highlight ? "text-emerald-600" : "text-gray-900"
                        }`}
                    >
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

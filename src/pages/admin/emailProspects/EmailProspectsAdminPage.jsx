import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaUserPlus,
    FaSearch,
    FaUpload,
    FaTrash,
    FaUndo,
    FaEnvelope,
    FaUserCheck,
    FaUserSlash,
    FaDownload,
    FaFileCsv,
    FaInfoCircle,
    FaChartLine,
    FaUserGraduate,
    FaPaperPlane,
    FaCog,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../../components/layout/PageContainer.jsx";
import KpiComponent from "../../../components/KpiComponent.jsx";
import {
    createEmailProspectRequest,
    deleteEmailProspectRequest,
    downloadProspectImportTemplateRequest,
    getEmailProspectsRequest,
    importEmailProspectsRequest,
    resubscribeEmailProspectRequest,
} from "../../../api/emailProspects.js";
import {
    ensureSystemEmailCampaignsRequest,
    executeEmailCampaignRequest,
    getEmailCampaignsRequest,
    SYSTEM_CAMPAIGN_KEY_WEEKLY_PROSPECTS,
} from "../../../api/adminEmailCampaign.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { useConfirm } from "../../../context/ConfirmationContext.jsx";
import {
    TABLE_WRAPPER,
    TABLE_TOOLBAR,
    THEAD,
    TH,
    TBODY,
    TD,
    TR_ROW,
    PRIMARY_BTN,
    formatRecordCount,
} from "../../../utils/expenseUiPatterns.js";
import formatDate from "../../../utils/formatDate.js";

const SECONDARY_BTN =
    "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";

export default function EmailProspectsAdminPage() {
    const toast = useToast();
    const confirm = useConfirm();

    const [prospects, setProspects] = useState([]);
    const [stats, setStats] = useState({
        active: 0,
        unsubscribed: 0,
        converted: 0,
        total: 0,
        contacted: 0,
        convertedAfterOutreach: 0,
        conversionRateAfterOutreach: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [form, setForm] = useState({
        email: "",
        firstName: "",
        companyName: "",
        notes: "",
    });
    const [importText, setImportText] = useState("");
    const [importReport, setImportReport] = useState(null);
    const [formError, setFormError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [prospectCampaignId, setProspectCampaignId] = useState(null);
    const [sendingOutreach, setSendingOutreach] = useState(false);

    const isValidEmailInput = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim().toLowerCase());

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [res, campaignsRes] = await Promise.all([
                getEmailProspectsRequest(),
                getEmailCampaignsRequest().catch(() => ({ data: [] })),
            ]);
            setProspects(res.data?.prospects ?? []);
            setStats(
                res.data?.stats ?? {
                    active: 0,
                    unsubscribed: 0,
                    converted: 0,
                    total: 0,
                    contacted: 0,
                    convertedAfterOutreach: 0,
                    conversionRateAfterOutreach: 0,
                },
            );
            const campaigns = Array.isArray(campaignsRes.data) ? campaignsRes.data : [];
            const prospectCampaign = campaigns.find(
                (c) => c.campaignKey === SYSTEM_CAMPAIGN_KEY_WEEKLY_PROSPECTS,
            );
            setProspectCampaignId(prospectCampaign?.campaignId ?? null);
        } catch (err) {
            console.error(err);
            toast.error("Error", "No se pudieron cargar los prospectos.");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        let list = prospects;
        if (statusFilter !== "ALL") {
            list = list.filter((p) => p.status === statusFilter);
        }
        const q = searchQuery.trim().toLowerCase();
        if (!q) return list;
        return list.filter((p) =>
            [p.email, p.firstName, p.lastName, p.companyName, p.notes]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(q),
        );
    }, [prospects, searchQuery, statusFilter]);

    const handleCreate = async (e) => {
        e.preventDefault();
        const email = form.email.trim();
        if (!email) {
            setFormError("Ingresa un correo electrónico.");
            return;
        }
        if (!isValidEmailInput(email)) {
            setFormError("El correo no tiene un formato válido (ej: contacto@empresa.cl).");
            return;
        }
        setBusy(true);
        setFormError(null);
        try {
            const res = await createEmailProspectRequest({
                email,
                firstName: form.firstName.trim() || null,
                companyName: form.companyName.trim() || null,
                notes: form.notes.trim() || null,
            });
            const saved = res.data;
            const wasUpdate = prospects.some(
                (p) => p.email?.toLowerCase() === email.toLowerCase(),
            );
            toast.success(
                wasUpdate ? "Prospecto actualizado" : "Prospecto agregado",
                wasUpdate
                    ? "El correo ya estaba en la lista; se actualizaron los datos."
                    : "El correo se sumó a la lista activa.",
            );
            setForm({ email: "", firstName: "", companyName: "", notes: "" });
            setStatusFilter("ALL");
            setSearchQuery(saved?.email ?? email);
            await load();
        } catch (err) {
            const message =
                err.response?.data?.message ?? "No se pudo guardar el prospecto.";
            setFormError(message);
            toast.error("No se pudo agregar", message);
        } finally {
            setBusy(false);
        }
    };

    const handleImport = async (textOverride) => {
        const payload = String(textOverride ?? importText).trim();
        if (!payload) return;
        setBusy(true);
        setImportReport(null);
        try {
            const res = await importEmailProspectsRequest({ text: payload, source: "import_csv" });
            const data = res.data ?? {};
            setImportReport(data);
            toast.success(
                "Importación completada",
                `${data.created ?? 0} correo(s) cargados · ${data.skipped ?? 0} omitidos.`,
            );
            setImportText("");
            await load();
        } catch (err) {
            toast.error("Importación fallida", err.response?.data?.message ?? "Error.");
        } finally {
            setBusy(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await downloadProspectImportTemplateRequest();
        } catch (err) {
            console.error(err);
            toast.error("Error", "No se pudo descargar la plantilla.");
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            setImportText(text);
            await handleImport(text);
        } catch (err) {
            console.error(err);
            toast.error("Error", "No se pudo leer el archivo CSV.");
        } finally {
            event.target.value = "";
        }
    };

    const handleResubscribe = async (prospect) => {
        setBusy(true);
        try {
            await resubscribeEmailProspectRequest(prospect.prospectId);
            toast.success("Reactivado", `${prospect.email} volvió a la lista activa.`);
            await load();
        } catch (err) {
            toast.error("Error", err.response?.data?.message ?? "No se pudo reactivar.");
        } finally {
            setBusy(false);
        }
    };

    const handleSendOutreach = async () => {
        const pending = Math.max(0, (stats.active ?? 0) - (stats.contacted ?? 0));
        const ok = await confirm({
            title: "Enviar outreach ahora",
            message: `¿Disparar la campaña de prospectos manualmente? Se enviarán hasta 70 correos (hay ~${pending.toLocaleString("es-CL")} en cola sin contactar este mes).`,
            variant: "danger",
            confirmText: "Enviar outreach",
            cancelText: "Cancelar",
        });
        if (!ok) return;

        setSendingOutreach(true);
        try {
            await ensureSystemEmailCampaignsRequest();
            let campaignId = prospectCampaignId;
            if (!campaignId) {
                const campaignsRes = await getEmailCampaignsRequest();
                const campaigns = Array.isArray(campaignsRes.data) ? campaignsRes.data : [];
                campaignId = campaigns.find(
                    (c) => c.campaignKey === SYSTEM_CAMPAIGN_KEY_WEEKLY_PROSPECTS,
                )?.campaignId;
            }
            if (!campaignId) {
                toast.error("Error", "No se encontró la campaña de prospectos.");
                return;
            }
            await executeEmailCampaignRequest(campaignId);
            toast.success("Outreach enviado", "Revisa el historial de la campaña para ver resultados.");
            await load();
        } catch (err) {
            toast.error(
                "No se pudo enviar",
                err.response?.data?.message ?? "Error al ejecutar la campaña de prospectos.",
            );
        } finally {
            setSendingOutreach(false);
        }
    };

    const handleDelete = async (prospect) => {
        const ok = await confirm({
            title: "Eliminar prospecto",
            message: `¿Eliminar ${prospect.email} de la lista?`,
            variant: "danger",
        });
        if (!ok) return;
        setBusy(true);
        try {
            await deleteEmailProspectRequest(prospect.prospectId);
            toast.success("Eliminado", "El prospecto fue removido.");
            await load();
        } catch (err) {
            toast.error("Error", err.response?.data?.message ?? "No se pudo eliminar.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Prospectos de email"
                subtitle="Lista de contactos externos. Campaña automática lun/mié/vie con recuperación si el servidor estuvo apagado."
                actions={
                    <Link to="/admin/email-campaigns" className={SECONDARY_BTN}>
                        Ver campañas
                    </Link>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <KpiComponent title="Total" value={stats.total} icon={FaEnvelope} footer="En base de datos" />
                <KpiComponent
                    title="Activos"
                    value={stats.active}
                    icon={FaUserCheck}
                    footer="Reciben correos"
                />
                <KpiComponent
                    title="Contactados"
                    value={stats.contacted ?? 0}
                    icon={FaEnvelope}
                    footer="Recibieron al menos 1 outreach"
                />
                <KpiComponent
                    title="Registrados"
                    value={stats.converted ?? 0}
                    icon={FaUserGraduate}
                    footer="Convirtieron a usuario AppsFly"
                />
                <KpiComponent
                    title="Conversión (outreach)"
                    value={`${stats.conversionRateAfterOutreach ?? 0}%`}
                    icon={FaChartLine}
                    footer={`${stats.convertedAfterOutreach ?? 0} de ${stats.contacted ?? 0} contactados`}
                />
                <KpiComponent
                    title="Dados de baja"
                    value={stats.unsubscribed}
                    icon={FaUserSlash}
                    footer="No recibirán más correos"
                />
            </div>

            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex gap-3">
                <FaInfoCircle className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                    <p className="font-medium">Límites de envío a prospectos (anti-spam)</p>
                    <p className="mt-1 text-amber-800/90">
                        La campaña automática corre <strong>lunes, miércoles y viernes</strong> y
                        envía hasta <strong>70 correos por ciclo</strong> (de los 100/día del plan
                        gratuito de Resend; los otros 30 quedan para avisos de plan y reactivación).
                        Si el servidor estuvo apagado, al encenderse recupera el envío del último
                        día programado perdido. Rota remitente cada <strong>18 envíos</strong> (hola@,
                        novedades@, invitaciones@, contacto@ en appsfly.app). El resto queda en cola
                        para el próximo ciclo.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleSendOutreach}
                            disabled={sendingOutreach || loading}
                            className={PRIMARY_BTN}
                        >
                            <FaPaperPlane />
                            {sendingOutreach ? "Enviando…" : "Enviar outreach ahora"}
                        </button>
                        {prospectCampaignId && (
                            <Link
                                to={`/admin/email-campaigns/${prospectCampaignId}/edit`}
                                className={SECONDARY_BTN}
                            >
                                <FaCog /> Configurar campaña
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <FaUserPlus className="text-primary" />
                        Agregar prospecto
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-3" noValidate>
                        <input
                            type="text"
                            inputMode="email"
                            autoComplete="email"
                            required
                            placeholder="Correo * (ej: contacto@empresa.cl)"
                            value={form.email}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, email: e.target.value }));
                                if (formError) setFormError(null);
                            }}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Nombre (opcional)"
                            value={form.firstName}
                            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Empresa (opcional)"
                            value={form.companyName}
                            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <button type="submit" disabled={busy} className={PRIMARY_BTN}>
                            {busy ? "Guardando…" : "Agregar"}
                        </button>
                        {formError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {formError}
                            </p>
                        )}
                    </form>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <FaUpload className="text-secondary" />
                        Carga masiva (CSV)
                    </h2>
                    <p className="text-xs text-slate-500 mb-3">
                        Columna obligatoria: <strong>email</strong>. Opcionales: nombre, empresa,
                        notas. No se duplican usuarios registrados ni prospectos ya en la lista.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            disabled={busy}
                            className={SECONDARY_BTN}
                        >
                            <FaDownload />
                            Descargar plantilla CSV
                        </button>
                        <label className={`${SECONDARY_BTN} cursor-pointer`}>
                            <FaFileCsv />
                            Subir archivo CSV
                            <input
                                type="file"
                                accept=".csv,text/csv,.txt"
                                className="hidden"
                                disabled={busy}
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                    <textarea
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        rows={6}
                        placeholder="email,nombre,empresa,notas&#10;contacto@empresa.cl,Juan,Óptica Central"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono mb-3"
                    />
                    <button
                        type="button"
                        onClick={() => handleImport()}
                        disabled={busy || !importText.trim()}
                        className={PRIMARY_BTN}
                    >
                        Importar lista
                    </button>

                    {importReport && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                            <p className="font-semibold text-slate-800 mb-2">Reporte de importación</p>
                            <ul className="space-y-1 text-slate-600">
                                <li>
                                    <span className="text-primary font-medium">
                                        {importReport.created ?? 0}
                                    </span>{" "}
                                    correo(s) cargados correctamente
                                </li>
                                <li>
                                    <span className="text-slate-800 font-medium">
                                        {importReport.skipped ?? 0}
                                    </span>{" "}
                                    omitidos en total
                                </li>
                                {importReport.breakdown && (
                                    <>
                                        {importReport.breakdown.alreadyRegisteredUser > 0 && (
                                            <li>
                                                · {importReport.breakdown.alreadyRegisteredUser}{" "}
                                                ya son usuarios AppsFly
                                            </li>
                                        )}
                                        {importReport.breakdown.alreadyConverted > 0 && (
                                            <li>
                                                · {importReport.breakdown.alreadyConverted}{" "}
                                                ya registrados como usuarios
                                            </li>
                                        )}
                                        {importReport.breakdown.alreadyProspect > 0 && (
                                            <li>
                                                · {importReport.breakdown.alreadyProspect} ya en
                                                lista de prospectos
                                            </li>
                                        )}
                                        {importReport.breakdown.alreadyUnsubscribed > 0 && (
                                            <li>
                                                · {importReport.breakdown.alreadyUnsubscribed} dados
                                                de baja
                                            </li>
                                        )}
                                        {importReport.breakdown.duplicateInFile > 0 && (
                                            <li>
                                                · {importReport.breakdown.duplicateInFile}{" "}
                                                duplicados en el archivo
                                            </li>
                                        )}
                                        {importReport.breakdown.invalidEmail > 0 && (
                                            <li>
                                                · {importReport.breakdown.invalidEmail} correos
                                                inválidos
                                            </li>
                                        )}
                                    </>
                                )}
                            </ul>
                            {importReport.truncated && (
                                <p className="mt-2 text-xs text-amber-700">
                                    Se procesaron solo las primeras 2.000 filas del archivo.
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </div>

            <div className={TABLE_WRAPPER}>
                <div className={TABLE_TOOLBAR}>
                    <div className="relative flex-1 max-w-md">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar correo, nombre, empresa…"
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                        <option value="ALL">Todos</option>
                        <option value="ACTIVE">Activos</option>
                        <option value="CONVERTED">Registrados (conversión)</option>
                        <option value="UNSUBSCRIBED">Dados de baja</option>
                    </select>
                    <span className="text-sm text-slate-500">
                        {formatRecordCount(filtered.length, "prospecto", "prospectos")}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                        <thead className={THEAD}>
                            <tr>
                                <th className={TH}>Correo</th>
                                <th className={TH}>Nombre</th>
                                <th className={TH}>Empresa</th>
                                <th className={TH}>Correos enviados</th>
                                <th className={TH}>Estado</th>
                                <th className={TH}>Conversión</th>
                                <th className={TH}>Creado</th>
                                <th className={TH} />
                            </tr>
                        </thead>
                        <tbody className={TBODY}>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className={`${TD} text-center py-10 text-slate-400`}>
                                        Cargando…
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={`${TD} text-center py-12 text-slate-400`}>
                                        Sin prospectos en esta vista.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <motion.tr
                                        key={p.prospectId}
                                        className={TR_ROW}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td className={TD}>
                                            <span className="font-medium text-slate-800">{p.email}</span>
                                        </td>
                                        <td className={TD}>{p.firstName || "—"}</td>
                                        <td className={TD}>{p.companyName || "—"}</td>
                                        <td className={TD}>
                                            <span className="text-sm text-slate-700">
                                                {p.outreachEmailsSent ?? 0}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    p.status === "ACTIVE"
                                                        ? "bg-primary/10 text-primary border border-primary/20"
                                                        : p.status === "CONVERTED"
                                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                          : "bg-slate-100 text-slate-500 border border-slate-200"
                                                }`}
                                            >
                                                {p.status === "ACTIVE"
                                                    ? "Activo"
                                                    : p.status === "CONVERTED"
                                                      ? "Usuario AppsFly"
                                                      : "Baja"}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            {p.status === "CONVERTED" ? (
                                                <div className="text-xs text-slate-600">
                                                    <span className="text-emerald-700 font-medium">
                                                        Registrado
                                                    </span>
                                                    {p.convertedAt && (
                                                        <p className="text-slate-400 mt-0.5">
                                                            {formatDate(p.convertedAt)}
                                                        </p>
                                                    )}
                                                    {p.convertedUserId && (
                                                        <Link
                                                            to={`/admin/users`}
                                                            className="text-primary hover:underline"
                                                        >
                                                            Ver usuarios
                                                        </Link>
                                                    )}
                                                </div>
                                            ) : p.outreachEmailsSent > 0 ? (
                                                <span className="text-xs text-slate-500">
                                                    Contactado, sin registro
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className={TD}>
                                            <span className="text-sm text-slate-500">
                                                {formatDate(p.createdAt)}
                                            </span>
                                        </td>
                                        <td className={TD}>
                                            <div className="flex gap-2">
                                                {p.status === "UNSUBSCRIBED" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResubscribe(p)}
                                                        disabled={busy}
                                                        className="text-xs font-medium text-primary hover:text-primary/80"
                                                    >
                                                        <FaUndo className="inline mr-1" />
                                                        Reactivar
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(p)}
                                                    disabled={busy}
                                                    className="text-xs font-medium text-red-600 hover:text-red-700"
                                                >
                                                    <FaTrash className="inline mr-1" />
                                                    Eliminar
                                                </button>
                                            </div>
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

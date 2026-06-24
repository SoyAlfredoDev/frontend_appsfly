import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFileInvoice, FaSearch, FaSync, FaDownload } from "react-icons/fa";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import TaxDocumentStatusBadge from "../../components/billing/TaxDocumentStatusBadge.jsx";
import {
    getTaxBillingDashboardRequest,
    listTaxDocumentsRequest,
    syncTaxDocumentStatusRequest,
} from "../../api/taxDocuments.js";
import {
    KPI_CARD,
    KPI_ICON_PRIMARY,
    KPI_ICON_SECONDARY,
    KPI_ICON_AMBER,
    KPI_LABEL,
    KPI_VALUE,
    TABLE_WRAPPER,
    THEAD,
    TH,
    TBODY,
    TD,
    TR_ROW,
    PRIMARY_BTN,
} from "../../utils/expenseUiPatterns.js";
import formatCurrency from "../../utils/formatCurrency.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function TaxBillingPage() {
    const toast = useToast();
    const [stats, setStats] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [folio, setFolio] = useState("");
    const [rut, setRut] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [dashboardRes, listRes] = await Promise.all([
                getTaxBillingDashboardRequest(),
                listTaxDocumentsRequest({
                    search: search || undefined,
                    folio: folio || undefined,
                    rut: rut || undefined,
                }),
            ]);
            setStats(dashboardRes.data);
            setRows(listRes.data?.rows ?? []);
        } catch (error) {
            toast.error(
                "Facturación",
                error.response?.data?.error ?? "No se pudo cargar la información.",
            );
        } finally {
            setLoading(false);
        }
    }, [folio, rut, search, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSync = async (id) => {
        try {
            await syncTaxDocumentStatusRequest(id);
            toast.success("Estado actualizado", "Se sincronizó con el proveedor.");
            loadData();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.error ?? "No se pudo sincronizar.",
            );
        }
    };

    const subtitle = useMemo(
        () => "Emisión y seguimiento de boletas y facturas electrónicas (Auth.cl)",
        [],
    );

    return (
        <ExpensePageLayout title="Facturación Electrónica" subtitle={subtitle}>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className={KPI_CARD}>
                    <div className={KPI_ICON_PRIMARY}><FaFileInvoice /></div>
                    <div>
                        <p className={KPI_LABEL}>Boletas aceptadas</p>
                        <p className={KPI_VALUE}>{stats?.totalBoletas ?? "—"}</p>
                    </div>
                </div>
                <div className={KPI_CARD}>
                    <div className={KPI_ICON_SECONDARY}><FaFileInvoice /></div>
                    <div>
                        <p className={KPI_LABEL}>Facturas aceptadas</p>
                        <p className={KPI_VALUE}>{stats?.totalFacturas ?? "—"}</p>
                    </div>
                </div>
                <div className={KPI_CARD}>
                    <div className={KPI_ICON_AMBER}><FaFileInvoice /></div>
                    <div>
                        <p className={KPI_LABEL}>Rechazados</p>
                        <p className={KPI_VALUE}>{stats?.rejectedDocuments ?? "—"}</p>
                    </div>
                </div>
                <div className={KPI_CARD}>
                    <div className={KPI_ICON_PRIMARY}><FaFileInvoice /></div>
                    <div>
                        <p className={KPI_LABEL}>Pendientes</p>
                        <p className={KPI_VALUE}>{stats?.pendingDocuments ?? "—"}</p>
                    </div>
                </div>
            </div>

            <div className="card mt-6">
                <div className="card-body grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        className="input-field h-11"
                        placeholder="Buscar folio, RUT, venta…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <input
                        className="input-field h-11"
                        placeholder="Folio"
                        value={folio}
                        onChange={(e) => setFolio(e.target.value)}
                    />
                    <input
                        className="input-field h-11"
                        placeholder="RUT receptor"
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                    />
                    <button type="button" onClick={loadData} className={PRIMARY_BTN}>
                        <FaSearch /> Buscar
                    </button>
                </div>
            </div>

            <div className={`${TABLE_WRAPPER} mt-6`}>
                <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">Historial de DTE</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={THEAD}>
                            <tr>
                                <th className={TH}>Fecha</th>
                                <th className={TH}>Tipo</th>
                                <th className={TH}>Folio</th>
                                <th className={TH}>Venta</th>
                                <th className={TH}>Receptor</th>
                                <th className={TH}>Total</th>
                                <th className={TH}>Estado</th>
                                <th className={TH}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={TBODY}>
                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                                        Sin documentos tributarios.
                                    </td>
                                </tr>
                            )}
                            {rows.map((row) => (
                                <tr key={row.taxDocumentId} className={TR_ROW}>
                                    <td className={TD}>
                                        {new Date(row.createdAt).toLocaleString("es-CL")}
                                    </td>
                                    <td className={TD}>{row.documentType}</td>
                                    <td className={TD}>{row.folio ?? "—"}</td>
                                    <td className={TD}>{row.sale?.saleNumber ?? "—"}</td>
                                    <td className={TD}>{row.receiverName ?? row.receiverRut ?? "—"}</td>
                                    <td className={TD}>{formatCurrency(row.totalAmount ?? 0)}</td>
                                    <td className={TD}>
                                        <TaxDocumentStatusBadge status={row.status} />
                                    </td>
                                    <td className={TD}>
                                        <div className="flex items-center gap-2">
                                            {row.pdfUrl && (
                                                <a
                                                    href={row.pdfUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                                                >
                                                    <FaDownload /> PDF
                                                </a>
                                            )}
                                            {row.trackId && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSync(row.taxDocumentId)}
                                                    className="text-slate-500 hover:text-primary text-sm inline-flex items-center gap-1"
                                                >
                                                    <FaSync /> Estado
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ExpensePageLayout>
    );
}

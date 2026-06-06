import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCalendarAlt,
    FaChartBar,
    FaBoxes,
    FaFilePdf,
    FaFileExcel,
    FaEye,
    FaDownload,
    FaSpinner,
    FaChevronRight,
    FaTimes,
} from "react-icons/fa";
import ExpensePageLayout from "../components/ui/ExpensePageLayout.jsx";
import {
    KPI_CARD,
    KPI_ICON_PRIMARY,
    KPI_ICON_SECONDARY,
    KPI_ICON_AMBER,
    KPI_LABEL,
    KPI_VALUE,
    PRIMARY_BTN,
    TABLE_WRAPPER,
    THEAD,
    TH,
    TBODY,
    TD,
    TD_AMOUNT,
    TR_ROW,
    formatRecordCount,
} from "../utils/expenseUiPatterns.js";
import {
    generateMonthOptions,
    getCurrentMonthYear,
    toMonthYearKey,
    parseMonthYearKey,
    formatMonthYearLabel,
} from "../utils/monthOptions.js";
import { generateReportRequest } from "../api/reports.js";
import { getCategories } from "../api/category.js";
import { isAbortError } from "../hooks/useAbortEffect.js";
import { downloadReportCsv, downloadReportPdf } from "../utils/reportExport.jsx";
import formatCurrency from "../utils/formatCurrency.js";
import { useToast } from "../context/ToastContext.jsx";

const REPORT_CATALOG = [
    {
        id: "monthly-sales",
        title: "Ventas del Mes",
        description: "Detalle y totales de ventas por periodo mensual.",
        icon: FaCalendarAlt,
        iconClass: KPI_ICON_PRIMARY,
        accent: "border-primary/20 hover:border-primary/40",
    },
    {
        id: "yearly-sales",
        title: "Ventas por Año",
        description: "Resumen mensual acumulado de ventas anuales.",
        icon: FaChartBar,
        iconClass: KPI_ICON_SECONDARY,
        accent: "border-secondary/20 hover:border-secondary/40",
    },
    {
        id: "inventory-movements",
        title: "Movimiento de Inventario",
        description: "Entradas y salidas de productos en un rango de fechas.",
        icon: FaBoxes,
        iconClass: KPI_ICON_AMBER,
        accent: "border-amber-200 hover:border-amber-300",
    },
];

const FORMAT_OPTIONS = [
    { id: "pdf", label: "PDF", icon: FaFilePdf },
    { id: "csv", label: "Excel (CSV)", icon: FaFileExcel },
];

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const panelMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.22, ease: "easeOut" },
};

function toLocalDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function defaultInventoryRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
        startDate: toLocalDateKey(start),
        endDate: toLocalDateKey(now),
    };
}

function validateReportParams(reportId, params) {
    if (reportId === "inventory-movements") {
        if (!params.startDate || !params.endDate) {
            return "Indica fecha de inicio y fin.";
        }
        if (params.startDate > params.endDate) {
            return "La fecha de inicio debe ser anterior a la fecha de fin.";
        }
    }
    return null;
}

function buildRequestParams(reportId, params) {
    if (reportId === "monthly-sales") {
        const { month, year } = parseMonthYearKey(params.period);
        return { month, year };
    }
    if (reportId === "yearly-sales") {
        return { year: params.year };
    }
    return {
        startDate: params.startDate,
        endDate: params.endDate,
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    };
}

function paramsSignature(reportId, params) {
    return JSON.stringify(buildRequestParams(reportId, params));
}

function ReportPreviewTable({ reportData }) {
    if (!reportData.rows?.length) {
        return (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
                No hay registros para los filtros seleccionados.
            </div>
        );
    }

    if (reportData.reportType === "monthly-sales") {
        return (
            <table className="w-full text-left">
                <thead className={THEAD}>
                    <tr>
                        <th className={TH}>Fecha</th>
                        <th className={TH}>N° venta</th>
                        <th className={TH}>Cliente</th>
                        <th className={TH}>Total</th>
                        <th className={TH}>Abonado</th>
                    </tr>
                </thead>
                <tbody className={TBODY}>
                    {reportData.rows.map((row) => (
                        <tr key={row.id} className={TR_ROW}>
                            <td className={TD}>{new Date(row.date).toLocaleDateString("es-CL")}</td>
                            <td className={TD}>{row.number ?? "—"}</td>
                            <td className={TD}>{row.customer || "—"}</td>
                            <td className={TD_AMOUNT}>{formatCurrency(row.total)}</td>
                            <td className={TD}>{formatCurrency(row.paid)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    if (reportData.reportType === "yearly-sales") {
        return (
            <table className="w-full text-left">
                <thead className={THEAD}>
                    <tr>
                        <th className={TH}>Mes</th>
                        <th className={TH}>Transacciones</th>
                        <th className={TH}>Total ventas</th>
                        <th className={TH}>Abonado</th>
                        <th className={TH}>Pendiente</th>
                    </tr>
                </thead>
                <tbody className={TBODY}>
                    {reportData.rows.map((row) => (
                        <tr key={row.month} className={TR_ROW}>
                            <td className={TD}>{MONTH_NAMES[row.month - 1]}</td>
                            <td className={TD}>{row.transactionCount}</td>
                            <td className={TD_AMOUNT}>{formatCurrency(row.totalSales)}</td>
                            <td className={TD}>{formatCurrency(row.totalPaid)}</td>
                            <td className={TD}>{formatCurrency(row.totalPending)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    return (
        <table className="w-full text-left">
            <thead className={THEAD}>
                <tr>
                    <th className={TH}>Tipo</th>
                    <th className={TH}>Fecha</th>
                    <th className={TH}>Documento</th>
                    <th className={TH}>Producto</th>
                    <th className={TH}>Cant.</th>
                    <th className={TH}>Total</th>
                </tr>
            </thead>
            <tbody className={TBODY}>
                {reportData.rows.map((row) => (
                    <tr key={`${row.movementType}-${row.id}`} className={TR_ROW}>
                        <td className={TD}>
                            <span className={row.movementType === "ENTRADA" ? "text-primary font-medium" : "text-amber-600 font-medium"}>
                                {row.movementType}
                            </span>
                        </td>
                        <td className={TD}>{new Date(row.date).toLocaleDateString("es-CL")}</td>
                        <td className={TD}>{row.documentNumber}</td>
                        <td className={TD}>{row.productName}</td>
                        <td className={TD}>{row.quantity}</td>
                        <td className={TD_AMOUNT}>{formatCurrency(row.total)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function PreviewSkeleton() {
    return (
        <div className="space-y-3 animate-pulse p-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg" />
            ))}
        </div>
    );
}

export default function ReportsPage() {
    const toast = useToast();
    const monthOptions = useMemo(() => generateMonthOptions(36), []);
    const currentPeriod = useMemo(() => getCurrentMonthYear(), []);
    const inventoryDefaults = useMemo(() => defaultInventoryRange(), []);

    const [activeReport, setActiveReport] = useState(null);
    const [exportFormat, setExportFormat] = useState("pdf");
    const [params, setParams] = useState({
        period: toMonthYearKey(currentPeriod.month, currentPeriod.year),
        year: currentPeriod.year,
        ...inventoryDefaults,
        categoryId: "",
    });
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dataSignature, setDataSignature] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);

    const fetchAbortRef = useRef(null);
    const categoriesAbortRef = useRef(null);

    const resetFetchState = useCallback(() => {
        fetchAbortRef.current?.abort();
        fetchAbortRef.current = null;
        setLoading(false);
        setExporting(false);
    }, []);

    const clearPreview = useCallback(() => {
        setReportData(null);
        setDataSignature(null);
        setError(null);
    }, []);

    const closeReportPanel = useCallback(() => {
        resetFetchState();
        setActiveReport(null);
        clearPreview();
    }, [clearPreview, resetFetchState]);

    const loadCategories = useCallback(async () => {
        categoriesAbortRef.current?.abort();
        const controller = new AbortController();
        categoriesAbortRef.current = controller;

        setCategoriesLoading(true);
        try {
            const res = await getCategories({ signal: controller.signal });
            if (categoriesAbortRef.current !== controller) return;
            setCategories(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            if (!isAbortError(err)) {
                console.error("[Reports] Error cargando categorías:", err);
            }
        } finally {
            if (categoriesAbortRef.current === controller) {
                setCategoriesLoading(false);
            }
        }
    }, []);

    const handleSelectReport = (reportId) => {
        if (activeReport === reportId) {
            closeReportPanel();
            return;
        }

        resetFetchState();
        setActiveReport(reportId);
        clearPreview();

        if (reportId === "inventory-movements") {
            loadCategories();
        }
    };

    const handlePeriodChange = (e) => {
        const period = e.target.value;
        setParams((prev) => ({ ...prev, period }));
        if (import.meta.env.DEV) {
            console.log("[Reports] periodo mensual:", period);
        }
    };

    const handleYearChange = (e) => {
        const year = Number(e.target.value);
        setParams((prev) => ({ ...prev, year }));
        if (import.meta.env.DEV) {
            console.log("[Reports] año:", year);
        }
    };

    const handleStartDateChange = (e) => {
        const startDate = e.target.value;
        setParams((prev) => ({ ...prev, startDate }));
        if (import.meta.env.DEV) {
            console.log("[Reports] desde:", startDate);
        }
    };

    const handleEndDateChange = (e) => {
        const endDate = e.target.value;
        setParams((prev) => ({ ...prev, endDate }));
        if (import.meta.env.DEV) {
            console.log("[Reports] hasta:", endDate);
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setParams((prev) => ({ ...prev, categoryId }));
        if (import.meta.env.DEV) {
            console.log("[Reports] categoría:", categoryId || "(todas)");
        }
    };

    const handleFormatChange = (formatId) => {
        setExportFormat(formatId);
        if (import.meta.env.DEV) {
            console.log("[Reports] formato:", formatId);
        }
    };

    const fetchReport = useCallback(async (reportId, reportParams, signal) => {
        const requestParams = buildRequestParams(reportId, reportParams);
        if (import.meta.env.DEV) {
            console.log("[Reports] API →", reportId, requestParams);
        }
        const response = await generateReportRequest(reportId, requestParams, { signal });
        return response.data;
    }, []);

    const runReportQuery = useCallback(async (reportId, reportParams) => {
        const validationError = validateReportParams(reportId, reportParams);
        if (validationError) {
            setError(validationError);
            toast.error("Parámetros inválidos", validationError);
            return null;
        }

        fetchAbortRef.current?.abort();
        const controller = new AbortController();
        fetchAbortRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const data = await fetchReport(reportId, reportParams, controller.signal);
            if (fetchAbortRef.current !== controller) return null;

            if (import.meta.env.DEV) {
                console.log("[Reports] respuesta OK:", data.reportType, data.rows?.length, "filas");
            }

            setReportData(data);
            setDataSignature(paramsSignature(reportId, reportParams));
            return data;
        } catch (err) {
            if (!isAbortError(err)) {
                const message = err.response?.data?.error ?? "No se pudo generar el reporte.";
                setError(message);
                toast.error("Error en el reporte", message);
                clearPreview();
            }
            return null;
        } finally {
            if (fetchAbortRef.current === controller) {
                setLoading(false);
            }
        }
    }, [clearPreview, fetchReport, toast]);

    const handleGenerate = async () => {
        if (!activeReport || loading || exporting) return;
        await runReportQuery(activeReport, params);
    };

    const ensureReportData = async () => {
        if (!activeReport) return null;

        const signature = paramsSignature(activeReport, params);
        if (
            reportData &&
            dataSignature === signature &&
            reportData.reportType === activeReport
        ) {
            return reportData;
        }
        return runReportQuery(activeReport, params);
    };

    const handleDownload = async () => {
        if (!activeReport || loading || exporting) return;

        setExporting(true);
        try {
            const data = await ensureReportData();
            if (!data) return;

            if (exportFormat === "csv") {
                downloadReportCsv(data);
            } else {
                await downloadReportPdf(data);
            }
            toast.success("Descarga lista", "El archivo se generó correctamente.");
        } catch (err) {
            if (!isAbortError(err)) {
                console.error("[Reports] Error descarga:", err);
                toast.error("Error al descargar", "Intenta nuevamente en unos segundos.");
            }
        } finally {
            setExporting(false);
        }
    };

    const previewStale =
        activeReport &&
        reportData &&
        reportData.reportType === activeReport &&
        dataSignature !== paramsSignature(activeReport, params);

    const showPreview =
        activeReport &&
        reportData &&
        reportData.reportType === activeReport;

    const activeMeta = REPORT_CATALOG.find((r) => r.id === activeReport);
    const isBusy = loading || exporting;

    return (
        <ExpensePageLayout
            title="Reportes"
            subtitle="Analítica y exportación de documentos — consultas bajo demanda"
        >
            <p className="text-sm text-slate-500">
                Selecciona un reporte para configurar filtros. Los datos solo se consultan cuando presionas
                <span className="font-medium text-slate-700"> Ver reporte </span>
                o
                <span className="font-medium text-slate-700"> Descargar</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {REPORT_CATALOG.map((report) => {
                    const Icon = report.icon;
                    const isActive = activeReport === report.id;

                    return (
                        <button
                            key={report.id}
                            type="button"
                            onClick={() => handleSelectReport(report.id)}
                            className={`${KPI_CARD} text-left cursor-pointer transition-all border-2 hover:-translate-y-0.5 active:scale-[0.99] ${report.accent} ${
                                isActive ? "ring-2 ring-primary/30 border-primary/50" : ""
                            }`}
                        >
                            <div className={report.iconClass}>
                                <Icon className="text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={KPI_LABEL}>{report.title}</p>
                                <p className="text-sm text-slate-600 mt-1 leading-snug">
                                    {report.description}
                                </p>
                            </div>
                            <FaChevronRight
                                className={`text-slate-400 shrink-0 transition-transform ${
                                    isActive ? "rotate-90 text-primary" : ""
                                }`}
                            />
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {activeReport && activeMeta && (
                    <motion.div
                        key={activeReport}
                        {...panelMotion}
                        className="relative z-10"
                    >
                        <div className="card">
                            <div className="card-header flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-800">
                                        Parámetros — {activeMeta.title}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Configura el periodo y el formato de exportación
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeReportPanel}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                    aria-label="Cerrar parámetros"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="card-body space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeReport === "monthly-sales" && (
                                        <div>
                                            <label
                                                htmlFor="report-period"
                                                className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2"
                                            >
                                                Periodo mensual
                                            </label>
                                            <div className="relative">
                                                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10" />
                                                <select
                                                    id="report-period"
                                                    value={params.period}
                                                    onChange={handlePeriodChange}
                                                    disabled={isBusy}
                                                    className="select-field pl-10 pr-8 h-11 w-full"
                                                >
                                                    {monthOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {activeReport === "yearly-sales" && (
                                        <div>
                                            <label
                                                htmlFor="report-year"
                                                className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2"
                                            >
                                                Año
                                            </label>
                                            <select
                                                id="report-year"
                                                value={params.year}
                                                onChange={handleYearChange}
                                                disabled={isBusy}
                                                className="select-field h-11 w-full"
                                            >
                                                {Array.from({ length: 8 }, (_, i) => currentPeriod.year - i).map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {activeReport === "inventory-movements" && (
                                        <>
                                            <div>
                                                <label
                                                    htmlFor="report-start-date"
                                                    className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2"
                                                >
                                                    Desde
                                                </label>
                                                <input
                                                    id="report-start-date"
                                                    type="date"
                                                    value={params.startDate}
                                                    onChange={handleStartDateChange}
                                                    disabled={isBusy}
                                                    className="input-field h-11 w-full"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="report-end-date"
                                                    className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2"
                                                >
                                                    Hasta
                                                </label>
                                                <input
                                                    id="report-end-date"
                                                    type="date"
                                                    value={params.endDate}
                                                    onChange={handleEndDateChange}
                                                    disabled={isBusy}
                                                    className="input-field h-11 w-full"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="report-category"
                                                    className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2"
                                                >
                                                    Categoría (opcional)
                                                </label>
                                                <select
                                                    id="report-category"
                                                    value={params.categoryId}
                                                    onChange={handleCategoryChange}
                                                    disabled={isBusy || categoriesLoading}
                                                    className="select-field h-11 w-full"
                                                >
                                                    <option value="">Todas las categorías</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat.categoryId} value={cat.categoryId}>
                                                            {cat.categoryName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                                        Formato de descarga
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {FORMAT_OPTIONS.map((format) => {
                                            const FormatIcon = format.icon;
                                            const selected = exportFormat === format.id;
                                            return (
                                                <button
                                                    key={format.id}
                                                    type="button"
                                                    onClick={() => handleFormatChange(format.id)}
                                                    disabled={isBusy}
                                                    className={`inline-flex items-center gap-2 px-4 h-11 rounded-lg border text-sm font-medium transition-all ${
                                                        selected
                                                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                    }`}
                                                >
                                                    <FormatIcon />
                                                    {format.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {error}
                                    </div>
                                )}

                                {isBusy && (
                                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                        <FaSpinner className="animate-spin h-4 w-4" />
                                        {exporting ? "Preparando descarga…" : "Procesando reporte…"}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={isBusy}
                                        className={PRIMARY_BTN}
                                    >
                                        {loading ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaEye />
                                        )}
                                        Ver reporte
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        disabled={isBusy}
                                        className="btn-secondary"
                                    >
                                        {exporting ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaDownload />
                                        )}
                                        Descargar {exportFormat === "csv" ? "CSV" : "PDF"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeReport && (loading || showPreview) && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="relative z-0"
                    >
                        {loading && !reportData ? (
                            <div className={TABLE_WRAPPER}>
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800">Generando reporte…</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Consultando la base de datos del negocio</p>
                                </div>
                                <PreviewSkeleton />
                            </div>
                        ) : showPreview ? (
                            <div className="space-y-4">
                                {previewStale && (
                                    <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                        Los filtros cambiaron. Presiona <strong>Ver reporte</strong> para actualizar la vista previa.
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {reportData.reportType === "monthly-sales" && (
                                        <>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_PRIMARY}><FaCalendarAlt className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Total ventas</p>
                                                    <p className={KPI_VALUE}>{formatCurrency(reportData.summary.totalSales)}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_SECONDARY}><FaChartBar className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Abonado</p>
                                                    <p className={KPI_VALUE}>{formatCurrency(reportData.summary.totalPaid)}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_AMBER}><FaBoxes className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Pendiente</p>
                                                    <p className={KPI_VALUE}>{formatCurrency(reportData.summary.totalPending)}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_PRIMARY}><FaEye className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Transacciones</p>
                                                    <p className={KPI_VALUE}>{reportData.summary.transactionCount}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {reportData.reportType === "yearly-sales" && (
                                        <>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_PRIMARY}><FaChartBar className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Ventas anuales</p>
                                                    <p className={KPI_VALUE}>{formatCurrency(reportData.summary.totalSales)}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_SECONDARY}><FaCalendarAlt className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Abonado</p>
                                                    <p className={KPI_VALUE}>{formatCurrency(reportData.summary.totalPaid)}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_AMBER}><FaBoxes className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Transacciones</p>
                                                    <p className={KPI_VALUE}>{reportData.summary.transactionCount}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                                    <FaCalendarAlt className="text-xl" />
                                                </div>
                                                <div>
                                                    <p className={KPI_LABEL}>Año</p>
                                                    <p className={KPI_VALUE}>{reportData.period.year}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {reportData.reportType === "inventory-movements" && (
                                        <>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_PRIMARY}><FaBoxes className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Entradas</p>
                                                    <p className={KPI_VALUE}>{reportData.summary.inboundMovements}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_AMBER}><FaChartBar className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Salidas</p>
                                                    <p className={KPI_VALUE}>{reportData.summary.outboundMovements}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_SECONDARY}><FaCalendarAlt className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Cant. neta</p>
                                                    <p className={KPI_VALUE}>{reportData.summary.netQuantity}</p>
                                                </div>
                                            </div>
                                            <div className={KPI_CARD}>
                                                <div className={KPI_ICON_PRIMARY}><FaEye className="text-xl" /></div>
                                                <div>
                                                    <p className={KPI_LABEL}>Movimientos</p>
                                                    <p className={KPI_VALUE}>{reportData.rows.length}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className={TABLE_WRAPPER}>
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">
                                            Vista previa
                                            {reportData.reportType === "monthly-sales" && (
                                                <> — {formatMonthYearLabel(reportData.period.month, reportData.period.year)}</>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatRecordCount(reportData.rows.length, false)}
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                                        <ReportPreviewTable reportData={reportData} />
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </ExpensePageLayout>
    );
}

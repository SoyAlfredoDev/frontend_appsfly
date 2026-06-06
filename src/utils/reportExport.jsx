import { pdf } from "@react-pdf/renderer";
import ReportPdfDocument from "../components/reports/ReportPdfDocument.jsx";
import formatCurrency from "./formatCurrency.js";
import { formatMonthYearLabel } from "./monthOptions.js";

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function escapeCsvCell(value) {
    const text = value == null ? "" : String(value);
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function formatReportDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("es-CL");
}

function getReportTitle(reportData) {
    switch (reportData.reportType) {
        case "monthly-sales":
            return `Ventas del mes — ${formatMonthYearLabel(reportData.period.month, reportData.period.year)}`;
        case "yearly-sales":
            return `Ventas por año — ${reportData.period.year}`;
        case "inventory-movements":
            return `Movimiento de inventario — ${reportData.period.startDate} a ${reportData.period.endDate}`;
        default:
            return "Reporte AppsFly";
    }
}

function buildCsvContent(reportData) {
    const title = getReportTitle(reportData);
    const lines = [title, `Generado: ${new Date().toLocaleString("es-CL")}`, ""];

    if (reportData.reportType === "monthly-sales") {
        lines.push(
            "Resumen",
            `Total ventas,${reportData.summary.totalSales}`,
            `Total abonado,${reportData.summary.totalPaid}`,
            `Saldo pendiente,${reportData.summary.totalPending}`,
            `Transacciones,${reportData.summary.transactionCount}`,
            "",
            "Fecha,N° venta,Cliente,Total,Abonado,Pendiente",
        );
        reportData.rows.forEach((row) => {
            lines.push([
                formatReportDate(row.date),
                row.number ?? "—",
                row.customer,
                row.total,
                row.paid,
                row.pending,
            ].map(escapeCsvCell).join(","));
        });
    }

    if (reportData.reportType === "yearly-sales") {
        lines.push(
            "Resumen",
            `Total ventas,${reportData.summary.totalSales}`,
            `Total abonado,${reportData.summary.totalPaid}`,
            `Saldo pendiente,${reportData.summary.totalPending}`,
            `Transacciones,${reportData.summary.transactionCount}`,
            "",
            "Mes,Transacciones,Total ventas,Abonado,Pendiente",
        );
        reportData.rows.forEach((row) => {
            lines.push([
                MONTH_NAMES[row.month - 1] ?? row.month,
                row.transactionCount,
                row.totalSales,
                row.totalPaid,
                row.totalPending,
            ].map(escapeCsvCell).join(","));
        });
    }

    if (reportData.reportType === "inventory-movements") {
        lines.push(
            "Resumen",
            `Entradas,${reportData.summary.inboundMovements}`,
            `Salidas,${reportData.summary.outboundMovements}`,
            `Cant. entrada,${reportData.summary.inboundQuantity}`,
            `Cant. salida,${reportData.summary.outboundQuantity}`,
            `Neto,${reportData.summary.netQuantity}`,
            "",
            "Tipo,Fecha,Documento,SKU,Producto,Categoría,Cantidad,Total",
        );
        reportData.rows.forEach((row) => {
            lines.push([
                row.movementType,
                formatReportDate(row.date),
                row.documentNumber,
                row.sku,
                row.productName,
                row.category,
                row.quantity,
                row.total,
            ].map(escapeCsvCell).join(","));
        });
    }

    return `\uFEFF${lines.join("\n")}`;
}

export function downloadReportCsv(reportData) {
    const csv = buildCsvContent(reportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const slug = reportData.reportType.replace(/-/g, "_");
    downloadBlob(blob, `appsfly_${slug}_${Date.now()}.csv`);
}

export async function downloadReportPdf(reportData) {
    const blob = await pdf(
        <ReportPdfDocument
            title={getReportTitle(reportData)}
            reportData={reportData}
            formatCurrency={formatCurrency}
            formatDate={formatReportDate}
            monthNames={MONTH_NAMES}
        />,
    ).toBlob();
    const slug = reportData.reportType.replace(/-/g, "_");
    downloadBlob(blob, `appsfly_${slug}_${Date.now()}.pdf`);
}

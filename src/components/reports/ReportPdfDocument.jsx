import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        paddingTop: 32,
        paddingHorizontal: 32,
        paddingBottom: 48,
        fontFamily: "Helvetica",
        fontSize: 9,
        color: "#1e293b",
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#021f41",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 9,
        color: "#64748b",
        marginBottom: 16,
    },
    summaryBox: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 4,
        padding: 10,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#01c676",
        color: "#ffffff",
        paddingVertical: 6,
        paddingHorizontal: 4,
        fontWeight: "bold",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingVertical: 5,
        paddingHorizontal: 4,
    },
    cell: { flex: 1, paddingRight: 4 },
    cellWide: { flex: 2, paddingRight: 4 },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 32,
        right: 32,
        textAlign: "center",
        fontSize: 8,
        color: "#94a3b8",
    },
});

function SummaryLine({ label, value, formatCurrency }) {
    const display = typeof value === "number" && label.toLowerCase().includes("total")
        ? formatCurrency(value)
        : String(value ?? 0);
    return (
        <View style={styles.summaryRow}>
            <Text>{label}</Text>
            <Text>{display}</Text>
        </View>
    );
}

function TableHeader({ columns }) {
    return (
        <View style={styles.tableHeader}>
            {columns.map((col) => (
                <Text key={col.key} style={col.wide ? styles.cellWide : styles.cell}>
                    {col.label}
                </Text>
            ))}
        </View>
    );
}

function MonthlySalesTable({ rows, formatCurrency, formatDate }) {
    const columns = [
        { key: "date", label: "Fecha" },
        { key: "number", label: "N°" },
        { key: "customer", label: "Cliente", wide: true },
        { key: "total", label: "Total" },
    ];
    return (
        <>
            <TableHeader columns={columns} />
            {rows.slice(0, 200).map((row) => (
                <View key={row.id} style={styles.tableRow}>
                    <Text style={styles.cell}>{formatDate(row.date)}</Text>
                    <Text style={styles.cell}>{row.number ?? "—"}</Text>
                    <Text style={styles.cellWide}>{row.customer}</Text>
                    <Text style={styles.cell}>{formatCurrency(row.total)}</Text>
                </View>
            ))}
        </>
    );
}

function YearlySalesTable({ rows, monthNames, formatCurrency }) {
    const columns = [
        { key: "month", label: "Mes" },
        { key: "count", label: "Tx" },
        { key: "total", label: "Ventas" },
        { key: "paid", label: "Abonado" },
    ];
    return (
        <>
            <TableHeader columns={columns} />
            {rows.map((row) => (
                <View key={row.month} style={styles.tableRow}>
                    <Text style={styles.cell}>{monthNames[row.month - 1]}</Text>
                    <Text style={styles.cell}>{row.transactionCount}</Text>
                    <Text style={styles.cell}>{formatCurrency(row.totalSales)}</Text>
                    <Text style={styles.cell}>{formatCurrency(row.totalPaid)}</Text>
                </View>
            ))}
        </>
    );
}

function InventoryTable({ rows, formatCurrency, formatDate }) {
    const columns = [
        { key: "type", label: "Tipo" },
        { key: "date", label: "Fecha" },
        { key: "product", label: "Producto", wide: true },
        { key: "qty", label: "Cant." },
    ];
    return (
        <>
            <TableHeader columns={columns} />
            {rows.slice(0, 200).map((row) => (
                <View key={`${row.movementType}-${row.id}`} style={styles.tableRow}>
                    <Text style={styles.cell}>{row.movementType}</Text>
                    <Text style={styles.cell}>{formatDate(row.date)}</Text>
                    <Text style={styles.cellWide}>{row.productName}</Text>
                    <Text style={styles.cell}>{row.quantity}</Text>
                </View>
            ))}
        </>
    );
}

export default function ReportPdfDocument({
    title,
    reportData,
    formatCurrency,
    formatDate,
    monthNames,
}) {
    const { summary, reportType } = reportData;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                    Generado el {new Date().toLocaleString("es-CL")} — AppsFly
                </Text>

                <View style={styles.summaryBox}>
                    {reportType === "monthly-sales" && (
                        <>
                            <SummaryLine label="Total ventas" value={summary.totalSales} formatCurrency={formatCurrency} />
                            <SummaryLine label="Total abonado" value={summary.totalPaid} formatCurrency={formatCurrency} />
                            <SummaryLine label="Transacciones" value={summary.transactionCount} formatCurrency={formatCurrency} />
                        </>
                    )}
                    {reportType === "yearly-sales" && (
                        <>
                            <SummaryLine label="Total ventas del año" value={summary.totalSales} formatCurrency={formatCurrency} />
                            <SummaryLine label="Total abonado" value={summary.totalPaid} formatCurrency={formatCurrency} />
                            <SummaryLine label="Transacciones" value={summary.transactionCount} formatCurrency={formatCurrency} />
                        </>
                    )}
                    {reportType === "inventory-movements" && (
                        <>
                            <SummaryLine label="Movimientos de entrada" value={summary.inboundMovements} formatCurrency={formatCurrency} />
                            <SummaryLine label="Movimientos de salida" value={summary.outboundMovements} formatCurrency={formatCurrency} />
                            <SummaryLine label="Cantidad neta" value={summary.netQuantity} formatCurrency={formatCurrency} />
                        </>
                    )}
                </View>

                {reportType === "monthly-sales" && (
                    <MonthlySalesTable rows={reportData.rows} formatCurrency={formatCurrency} formatDate={formatDate} />
                )}
                {reportType === "yearly-sales" && (
                    <YearlySalesTable rows={reportData.rows} monthNames={monthNames} formatCurrency={formatCurrency} />
                )}
                {reportType === "inventory-movements" && (
                    <InventoryTable rows={reportData.rows} formatCurrency={formatCurrency} formatDate={formatDate} />
                )}

                <Text style={styles.footer} fixed>
                    AppsFly — Reporte confidencial del negocio
                </Text>
            </Page>
        </Document>
    );
}

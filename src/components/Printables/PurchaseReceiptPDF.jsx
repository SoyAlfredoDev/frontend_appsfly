import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getPurchaseDetails } from "../../utils/normalizePurchase.js";

const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingHorizontal: 30,
        paddingBottom: 60,
        fontFamily: "Helvetica",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#021f41",
    },
    subtitle: {
        fontSize: 10,
        color: "#6b7280",
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 10,
        width: "28%",
        color: "#4b5563",
        fontWeight: "bold",
    },
    detailValue: {
        fontSize: 10,
        width: "72%",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#d1fae5",
        paddingVertical: 6,
        borderBottomColor: "#374151",
        borderBottomWidth: 1,
        marginTop: 16,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomColor: "#e5e7eb",
        borderBottomWidth: 1,
        paddingVertical: 5,
    },
    colSku: { width: "18%", fontSize: 9, paddingHorizontal: 4 },
    colName: { width: "34%", fontSize: 9, paddingHorizontal: 4 },
    colQty: { width: "12%", fontSize: 9, paddingHorizontal: 4, textAlign: "center" },
    colPrice: { width: "18%", fontSize: 9, paddingHorizontal: 4, textAlign: "right" },
    colTotal: { width: "18%", fontSize: 9, paddingHorizontal: 4, textAlign: "right", fontWeight: "bold" },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#374151",
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: "bold",
        marginRight: 12,
    },
    summaryValue: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#059669",
    },
    footer: {
        position: "absolute",
        bottom: 24,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 8,
        fontSize: 8,
        color: "#9ca3af",
        textAlign: "center",
    },
});

const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

const formatLabel = (text) => {
    if (!text) return "—";
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const statusLabel = (status) => {
    const map = {
        COMPLETED: "Completada",
        PENDING: "Pendiente",
        CANCELLED: "Anulada",
    };
    return map[status] || status || "—";
};

export default function PurchaseReceiptPDF({ purchase }) {
    const details = getPurchaseDetails(purchase);
    const dateStr = purchase?.purchaseDate
        || (purchase?.createdAt
            ? new Date(purchase.createdAt).toLocaleDateString("es-CL")
            : "—");

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>
                    Comprobante de compra #{purchase?.purchaseNumber ?? "—"}
                </Text>
                <Text style={styles.subtitle}>
                    Documento proveedor: {purchase?.purchaseRealNumber ?? "—"}
                </Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proveedor:</Text>
                    <Text style={styles.detailValue}>
                        {formatLabel(purchase?.provider?.providerName)}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha:</Text>
                    <Text style={styles.detailValue}>{dateStr}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estado:</Text>
                    <Text style={styles.detailValue}>
                        {statusLabel(purchase?.purchaseStatus)}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Registrado por:</Text>
                    <Text style={styles.detailValue}>
                        {purchase?.user
                            ? `${formatLabel(purchase.user.userFirstName)} ${formatLabel(purchase.user.userLastName)}`
                            : "—"}
                    </Text>
                </View>
                {purchase?.purchaseComment ? (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Notas:</Text>
                        <Text style={styles.detailValue}>{purchase.purchaseComment}</Text>
                    </View>
                ) : null}
                {purchase?.purchaseStatus === "CANCELLED" && purchase?.cancelledBy ? (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Anulada por:</Text>
                        <Text style={styles.detailValue}>
                            {formatLabel(purchase.cancelledBy.userFirstName)}{" "}
                            {formatLabel(purchase.cancelledBy.userLastName)}
                            {purchase.cancelledAt
                                ? ` — ${new Date(purchase.cancelledAt).toLocaleDateString("es-CL")}`
                                : ""}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.tableHeader}>
                    <Text style={styles.colSku}>SKU</Text>
                    <Text style={styles.colName}>Producto</Text>
                    <Text style={styles.colQty}>Cant.</Text>
                    <Text style={styles.colPrice}>Costo unit.</Text>
                    <Text style={styles.colTotal}>Total</Text>
                </View>

                {details.map((detail) => (
                    <View style={styles.tableRow} key={detail.purchaseDetailId}>
                        <Text style={styles.colSku}>
                            {detail.product?.productSKU || detail.service?.serviceSKU || "—"}
                        </Text>
                        <Text style={styles.colName}>
                            {formatLabel(
                                detail.product?.productName || detail.service?.serviceName,
                            )}
                        </Text>
                        <Text style={styles.colQty}>{detail.purchaseDetailQuantity}</Text>
                        <Text style={styles.colPrice}>
                            {formatCurrency(detail.purchaseDetailPrice)}
                        </Text>
                        <Text style={styles.colTotal}>
                            {formatCurrency(detail.purchaseDetailTotal)}
                        </Text>
                    </View>
                ))}

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total compra:</Text>
                    <Text style={styles.summaryValue}>
                        {formatCurrency(purchase?.purchaseTotal)}
                    </Text>
                </View>

                <Text style={styles.footer} fixed>
                    Generado por AppsFly — Comprobante interno de compra
                </Text>
            </Page>
        </Document>
    );
}

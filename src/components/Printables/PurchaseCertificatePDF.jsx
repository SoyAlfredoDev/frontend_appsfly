import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const BRAND = "#0f766e";

const styles = StyleSheet.create({
    page: {
        paddingTop: 28,
        paddingHorizontal: 36,
        paddingBottom: 40,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#1f2937",
    },
    headerBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: BRAND,
        marginBottom: 14,
    },
    logoWrap: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#f9fafb",
    },
    logo: { width: 76, height: 76, objectFit: "contain" },
    logoFallback: { fontSize: 20, fontWeight: "bold", color: BRAND },
    businessBlock: { flex: 1 },
    businessName: { fontSize: 15, fontWeight: "bold", color: "#111827", marginBottom: 3 },
    businessMeta: { fontSize: 9, color: "#4b5563", marginBottom: 2, lineHeight: 1.35 },
    docTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: BRAND,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 4,
        textAlign: "center",
    },
    docSubtitle: {
        fontSize: 9,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 14,
    },
    infoRow: { flexDirection: "row", marginBottom: 5 },
    infoLabel: { width: "28%", fontSize: 9, color: "#6b7280", fontWeight: "bold" },
    infoValue: { width: "72%", fontSize: 9, color: "#111827" },
    sectionTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#374151",
        marginTop: 12,
        marginBottom: 6,
        textTransform: "uppercase",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#ccfbf1",
        paddingVertical: 6,
        borderBottomColor: BRAND,
        borderBottomWidth: 1,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomColor: "#e5e7eb",
        borderBottomWidth: 1,
        paddingVertical: 5,
    },
    colDesc: { width: "48%", fontSize: 8, paddingHorizontal: 4 },
    colQty: { width: "12%", fontSize: 8, paddingHorizontal: 4, textAlign: "center" },
    colPrice: { width: "20%", fontSize: 8, paddingHorizontal: 4, textAlign: "right" },
    colTotal: { width: "20%", fontSize: 8, paddingHorizontal: 4, textAlign: "right", fontWeight: "bold" },
    totalBox: {
        marginTop: 12,
        alignItems: "flex-end",
    },
    totalRow: {
        flexDirection: "row",
        width: "42%",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#374151",
        paddingTop: 6,
    },
    totalLabel: { fontSize: 11, fontWeight: "bold" },
    totalValue: { fontSize: 11, fontWeight: "bold", color: BRAND },
    observations: {
        marginTop: 16,
        padding: 10,
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 4,
    },
    observationsTitle: { fontSize: 9, fontWeight: "bold", color: "#6b7280", marginBottom: 4 },
    observationsText: { fontSize: 9, color: "#111827", lineHeight: 1.4 },
    signatures: {
        flexDirection: "row",
        marginTop: 36,
        gap: 24,
    },
    signBox: {
        flex: 1,
        alignItems: "center",
        minHeight: 90,
    },
    stampBox: {
        width: 120,
        height: 70,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderStyle: "dashed",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    stampHint: { fontSize: 8, color: "#9ca3af" },
    signLine: {
        width: "80%",
        borderTopWidth: 1,
        borderTopColor: "#9ca3af",
        marginTop: 40,
        marginBottom: 6,
    },
    signLabel: { fontSize: 8, color: "#6b7280", textAlign: "center" },
    signName: { fontSize: 9, fontWeight: "bold", color: "#111827", textAlign: "center" },
    footer: {
        position: "absolute",
        bottom: 18,
        left: 36,
        right: 36,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 6,
    },
    footerText: { fontSize: 7, color: "#9ca3af", textAlign: "center" },
});

const formatCurrency = (amount) =>
    (Number(amount) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

const formatDate = (value) => {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-CL");
};

function businessInitials(name) {
    if (!name?.trim()) return "?";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}

/**
 * PDF de Certificado de Compra (reembolsos ISAPRE / seguros).
 * Usa snapshots del certificado; no depende de la venta viva.
 */
export default function PurchaseCertificatePDF({ certificate, business }) {
    const logoUrl =
        certificate?.businessLogoSnapshot
        || business?.businessReceiptLogoUrl
        || business?.receiptLogoUrl
        || null;
    const businessName =
        certificate?.businessNameSnapshot
        || business?.businessName
        || "Óptica";
    const businessDoc = certificate?.businessDocumentSnapshot || "";
    const businessAddress =
        certificate?.businessAddressSnapshot
        || business?.businessReceiptAddress
        || "";

    const lines = (certificate?.details || []).filter((d) => d.lineIncluded !== false);
    const total = certificate?.certificateTotal
        ?? lines.reduce((s, d) => s + (Number(d.lineTotal) || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBox}>
                    <View style={styles.logoWrap}>
                        {logoUrl ? (
                            <Image src={logoUrl} style={styles.logo} />
                        ) : (
                            <Text style={styles.logoFallback}>{businessInitials(businessName)}</Text>
                        )}
                    </View>
                    <View style={styles.businessBlock}>
                        <Text style={styles.businessName}>{businessName}</Text>
                        {businessDoc ? <Text style={styles.businessMeta}>{businessDoc}</Text> : null}
                        {businessAddress ? <Text style={styles.businessMeta}>{businessAddress}</Text> : null}
                    </View>
                </View>

                <Text style={styles.docTitle}>Certificado de Compra</Text>
                <Text style={styles.docSubtitle}>
                    N° {certificate?.certificateNumber || "—"}
                    {certificate?.sale?.saleNumber
                        ? `  ·  Ref. venta #${certificate.sale.saleNumber}`
                        : ""}
                </Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Cliente</Text>
                    <Text style={styles.infoValue}>{certificate?.customerNameSnapshot || "—"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>RUT / Documento</Text>
                    <Text style={styles.infoValue}>{certificate?.customerDocumentSnapshot || "—"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fecha de emisión</Text>
                    <Text style={styles.infoValue}>
                        {formatDate(certificate?.certificateIssuedDate || certificate?.issuedAt)}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Detalle de productos / lentes adquiridos</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.colDesc}>Descripción</Text>
                    <Text style={styles.colQty}>Cant.</Text>
                    <Text style={styles.colPrice}>Valor unitario</Text>
                    <Text style={styles.colTotal}>Total</Text>
                </View>
                {lines.map((line) => (
                    <View key={line.purchaseCertificateDetailId} style={styles.tableRow} wrap={false}>
                        <Text style={styles.colDesc}>{line.lineDescription}</Text>
                        <Text style={styles.colQty}>{line.lineQuantity}</Text>
                        <Text style={styles.colPrice}>{formatCurrency(line.lineUnitPrice)}</Text>
                        <Text style={styles.colTotal}>{formatCurrency(line.lineTotal)}</Text>
                    </View>
                ))}

                <View style={styles.totalBox}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total informado</Text>
                        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                    </View>
                </View>

                {certificate?.certificateComment ? (
                    <View style={styles.observations}>
                        <Text style={styles.observationsTitle}>Observaciones</Text>
                        <Text style={styles.observationsText}>{certificate.certificateComment}</Text>
                    </View>
                ) : null}

                <View style={styles.signatures}>
                    <View style={styles.signBox}>
                        <View style={styles.signLine} />
                        <Text style={styles.signName}>
                            {certificate?.certificateResponsibleName || "Responsable"}
                        </Text>
                        <Text style={styles.signLabel}>Nombre y firma</Text>
                    </View>
                    <View style={styles.signBox}>
                        <View style={styles.stampBox}>
                            <Text style={styles.stampHint}>Espacio para sello</Text>
                        </View>
                        <Text style={styles.signLabel}>Sello de la óptica</Text>
                    </View>
                </View>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        Documento informativo para reembolsos ante ISAPRE, FONASA, seguros o convenios.
                        No reemplaza la boleta o factura tributaria.
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

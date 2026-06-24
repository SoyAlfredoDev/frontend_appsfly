import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { getReceiptBranding } from '../../utils/businessReceiptSettings.js';

const BRAND_GREEN = '#059669';

const styles = StyleSheet.create({
    page: {
        paddingTop: 28,
        paddingHorizontal: 32,
        paddingBottom: 72,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1f2937',
    },
    headerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingBottom: 14,
        borderBottomWidth: 2,
        borderBottomColor: BRAND_GREEN,
        marginBottom: 16,
    },
    logoWrap: {
        width: 88,
        height: 88,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#f9fafb',
    },
    logo: {
        width: 84,
        height: 84,
        objectFit: 'contain',
    },
    logoFallback: {
        fontSize: 22,
        fontWeight: 'bold',
        color: BRAND_GREEN,
    },
    businessBlock: {
        flex: 1,
    },
    businessName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    businessMeta: {
        fontSize: 9,
        color: '#4b5563',
        marginBottom: 2,
        lineHeight: 1.35,
    },
    docTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: BRAND_GREEN,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
        gap: 4,
    },
    infoItem: {
        width: '48%',
        flexDirection: 'row',
        marginBottom: 6,
    },
    infoLabel: {
        width: '38%',
        fontSize: 9,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    infoValue: {
        width: '62%',
        fontSize: 9,
        color: '#111827',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#d1fae5',
        paddingVertical: 6,
        borderBottomColor: BRAND_GREEN,
        borderBottomWidth: 1,
        marginTop: 12,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#e5e7eb',
        borderBottomWidth: 1,
        paddingVertical: 5,
    },
    colType: { width: '14%', fontSize: 8, paddingHorizontal: 4 },
    colSKU: { width: '14%', fontSize: 8, paddingHorizontal: 4 },
    colName: { width: '32%', fontSize: 8, paddingHorizontal: 4 },
    colQty: { width: '10%', fontSize: 8, paddingHorizontal: 4, textAlign: 'center' },
    colPrice: { width: '15%', fontSize: 8, paddingHorizontal: 4, textAlign: 'right' },
    colTotal: { width: '15%', fontSize: 8, paddingHorizontal: 4, textAlign: 'right', fontWeight: 'bold' },
    summaryWrapper: {
        marginTop: 16,
        alignItems: 'flex-end',
    },
    summaryRow: {
        flexDirection: 'row',
        width: '45%',
        justifyContent: 'space-between',
        marginTop: 4,
        paddingTop: 4,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
    },
    summaryValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111827',
    },
    summaryTotalRow: {
        flexDirection: 'row',
        width: '45%',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 18,
        left: 32,
        right: 32,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    footerText: {
        fontSize: 8,
        color: '#6b7280',
        marginBottom: 2,
        lineHeight: 1.35,
    },
    footerPageNumber: {
        fontSize: 8,
        color: '#9ca3af',
        textAlign: 'right',
    },
});

const formatCurrency = (amount) =>
    amount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) || '$0';

function capitalizeFirstLetter(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function businessInitials(name) {
    if (!name?.trim()) return '?';
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

const SimpleTestPDFContent = ({ sale, tableProductAndService, business }) => {
    const branding = getReceiptBranding(business);
    const customerName = [
        capitalizeFirstLetter(sale.customer?.customerFirstName),
        capitalizeFirstLetter(sale.customer?.customerLastName),
    ].filter(Boolean).join(' ');
    const sellerName = [
        capitalizeFirstLetter(sale.user?.userFirstName),
        capitalizeFirstLetter(sale.user?.userLastName),
    ].filter(Boolean).join(' ');

    const headerContactLines = [
        branding.documentNumber
            ? `${branding.documentLabel}: ${branding.documentNumber}`
            : null,
        branding.address || null,
        branding.phone ? `Tel: ${branding.phone}` : null,
        branding.email || null,
        branding.social ? branding.social : null,
    ].filter(Boolean);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBox}>
                    <View style={styles.logoWrap}>
                        {branding.logoUrl ? (
                            <Image src={branding.logoUrl} style={styles.logo} />
                        ) : (
                            <Text style={styles.logoFallback}>
                                {businessInitials(branding.displayName)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.businessBlock}>
                        <Text style={styles.businessName}>
                            {branding.displayName || 'Mi negocio'}
                        </Text>
                        {headerContactLines.map((line) => (
                            <Text key={line} style={styles.businessMeta}>{line}</Text>
                        ))}
                    </View>
                </View>

                <Text style={styles.docTitle}>
                    Comprobante de venta N° {sale?.saleNumber ?? '—'}
                </Text>

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Fecha</Text>
                        <Text style={styles.infoValue}>
                            {sale?.createdAt
                                ? new Date(sale.createdAt).toLocaleDateString('es-CL')
                                : '—'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Cliente</Text>
                        <Text style={styles.infoValue}>{customerName || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Vendedor</Text>
                        <Text style={styles.infoValue}>{sellerName || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Observaciones</Text>
                        <Text style={styles.infoValue}>
                            {sale?.saleComment || sale?.saleObservation || '—'}
                        </Text>
                    </View>
                </View>

                <View>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
                        Detalle
                    </Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colType}>Tipo</Text>
                        <Text style={styles.colSKU}>SKU</Text>
                        <Text style={styles.colName}>Producto / Servicio</Text>
                        <Text style={styles.colQty}>Cant.</Text>
                        <Text style={styles.colPrice}>Precio</Text>
                        <Text style={styles.colTotal}>Total</Text>
                    </View>

                    {tableProductAndService?.map((ps) => (
                        <View style={styles.tableRow} key={ps.saleDetailId}>
                            <Text style={styles.colType}>
                                {ps.saleDetailType === 'PRODUCT' ? 'Producto' : 'Servicio'}
                            </Text>
                            <Text style={styles.colSKU}>
                                {ps.product?.productSKU || ps.service?.serviceSKU || '—'}
                            </Text>
                            <Text style={styles.colName}>
                                {ps.product?.productName || ps.service?.serviceName || '—'}
                            </Text>
                            <Text style={styles.colQty}>{ps.saleDetailQuantity}</Text>
                            <Text style={styles.colPrice}>{formatCurrency(ps.saleDetailPrice)}</Text>
                            <Text style={styles.colTotal}>{formatCurrency(ps.saleDetailTotal)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.summaryWrapper}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total venta</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(sale?.saleTotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total pagado</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency((sale?.saleTotal ?? 0) - (sale?.salePendingAmount ?? 0))}
                        </Text>
                    </View>
                    <View style={styles.summaryTotalRow}>
                        <Text style={styles.summaryLabel}>Saldo pendiente</Text>
                        <Text style={{
                            ...styles.summaryValue,
                            color: (sale?.salePendingAmount ?? 0) > 0 ? '#b91c1c' : BRAND_GREEN,
                        }}>
                            {formatCurrency(sale?.salePendingAmount)}
                        </Text>
                    </View>
                </View>

                <View style={styles.footerContainer} fixed>
                    <View style={{ width: '72%' }}>
                        {branding.footerNote ? (
                            <Text style={styles.footerText}>{branding.footerNote}</Text>
                        ) : (
                            <Text style={styles.footerText}>
                                Documento interno generado por AppsFly.
                            </Text>
                        )}
                    </View>
                    <Text
                        style={styles.footerPageNumber}
                        render={({ pageNumber, totalPages }) =>
                            `Pág. ${pageNumber} / ${totalPages}`
                        }
                        fixed
                    />
                </View>
            </Page>
        </Document>
    );
};

export default SimpleTestPDFContent;

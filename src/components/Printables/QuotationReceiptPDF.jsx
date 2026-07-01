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
    logo: { width: 84, height: 84, objectFit: 'contain' },
    logoFallback: { fontSize: 22, fontWeight: 'bold', color: BRAND_GREEN },
    businessBlock: { flex: 1 },
    businessName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
    businessMeta: { fontSize: 9, color: '#4b5563', marginBottom: 2, lineHeight: 1.35 },
    docTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: BRAND_GREEN,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, gap: 4 },
    infoItem: { width: '48%', flexDirection: 'row', marginBottom: 6 },
    infoLabel: { width: '38%', fontSize: 9, color: '#6b7280', fontWeight: 'bold' },
    infoValue: { width: '62%', fontSize: 9, color: '#111827' },
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
    summaryWrapper: { marginTop: 16, alignItems: 'flex-end' },
    summaryRow: {
        flexDirection: 'row',
        width: '45%',
        justifyContent: 'space-between',
        marginTop: 4,
        paddingTop: 4,
    },
    summaryLabel: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
    summaryValue: { fontSize: 10, fontWeight: 'bold', color: '#111827' },
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
    },
    footerText: { fontSize: 8, color: '#6b7280', textAlign: 'center', lineHeight: 1.35 },
});

const formatCurrency = (amount) =>
    amount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) || '$0';

function businessInitials(name) {
    if (!name?.trim()) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

const QuotationReceiptPDFContent = ({ quotation, details = [], business, netTotal, ivaTotal, total }) => {
    const branding = getReceiptBranding(business);
    const customerName = [
        quotation?.customer?.customerFirstName,
        quotation?.customer?.customerLastName,
    ].filter(Boolean).join(' ');

    const headerContactLines = [
        branding.documentNumber ? `${branding.documentLabel}: ${branding.documentNumber}` : null,
        branding.address || null,
        branding.phone ? `Tel: ${branding.phone}` : null,
        branding.email || null,
    ].filter(Boolean);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBox}>
                    <View style={styles.logoWrap}>
                        {branding.logoUrl ? (
                            <Image src={branding.logoUrl} style={styles.logo} />
                        ) : (
                            <Text style={styles.logoFallback}>{businessInitials(branding.displayName)}</Text>
                        )}
                    </View>
                    <View style={styles.businessBlock}>
                        <Text style={styles.businessName}>{branding.displayName || 'Mi negocio'}</Text>
                        {headerContactLines.map((line) => (
                            <Text key={line} style={styles.businessMeta}>{line}</Text>
                        ))}
                    </View>
                </View>

                <Text style={styles.docTitle}>
                    Cotización N° {quotation?.quotationNumber ?? '—'}
                </Text>

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Fecha</Text>
                        <Text style={styles.infoValue}>{quotation?.quotationDate || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Cliente</Text>
                        <Text style={styles.infoValue}>{customerName || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Estado</Text>
                        <Text style={styles.infoValue}>{quotation?.quotationStatus || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Observaciones</Text>
                        <Text style={styles.infoValue}>{quotation?.quotationComment || '—'}</Text>
                    </View>
                </View>

                <View>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Detalle</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colType}>Tipo</Text>
                        <Text style={styles.colSKU}>SKU</Text>
                        <Text style={styles.colName}>Producto / Servicio</Text>
                        <Text style={styles.colQty}>Cant.</Text>
                        <Text style={styles.colPrice}>Precio</Text>
                        <Text style={styles.colTotal}>Total</Text>
                    </View>

                    {details.map((item) => {
                        const isProduct = item.quotationDetailType === 'PRODUCT';
                        return (
                            <View style={styles.tableRow} key={item.quotationDetailId}>
                                <Text style={styles.colType}>{isProduct ? 'Producto' : 'Servicio'}</Text>
                                <Text style={styles.colSKU}>
                                    {isProduct ? item.product?.productSKU : item.service?.serviceSKU || '—'}
                                </Text>
                                <Text style={styles.colName}>
                                    {isProduct ? item.product?.productName : item.service?.serviceName || '—'}
                                </Text>
                                <Text style={styles.colQty}>{item.quotationDetailQuantity}</Text>
                                <Text style={styles.colPrice}>{formatCurrency(item.quotationDetailPrice)}</Text>
                                <Text style={styles.colTotal}>{formatCurrency(item.quotationDetailTotal)}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.summaryWrapper}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Neto</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(netTotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>IVA (19%)</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(ivaTotal)}</Text>
                    </View>
                    <View style={styles.summaryTotalRow}>
                        <Text style={styles.summaryLabel}>Total cotización</Text>
                        <Text style={{ ...styles.summaryValue, color: BRAND_GREEN }}>
                            {formatCurrency(total)}
                        </Text>
                    </View>
                </View>

                <View style={styles.footerContainer} fixed>
                    <Text style={styles.footerText}>
                        {branding.footerNote || 'Cotización informativa generada por AppsFly.'}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default QuotationReceiptPDFContent;

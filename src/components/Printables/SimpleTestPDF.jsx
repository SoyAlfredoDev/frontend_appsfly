import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { getReceiptBranding } from '../../utils/businessReceiptSettings.js';

const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingHorizontal: 30,
        paddingBottom: 70,
        fontFamily: 'Helvetica',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    logo: {
        width: 72,
        height: 72,
        objectFit: 'contain',
    },
    businessName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    businessMeta: {
        fontSize: 9,
        color: '#4b5563',
        marginBottom: 2,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 10,
        width: '30%',
        color: '#4b5563',
        fontWeight: 'bold',
    },
    detailValue: {
        fontSize: 10,
        width: '70%',
        fontWeight: 'normal',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#bfdbfe',
        paddingVertical: 5,
        borderBottomColor: '#374151',
        borderBottomWidth: 1,
        marginTop: 15,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#e5e7eb',
        borderBottomWidth: 1,
        paddingVertical: 4,
    },
    colType: { width: '15%', fontSize: 9, paddingHorizontal: 5 },
    colSKU: { width: '15%', fontSize: 9, paddingHorizontal: 5 },
    colName: { width: '30%', fontSize: 9, paddingHorizontal: 5 },
    colQty: { width: '10%', fontSize: 9, paddingHorizontal: 5, textAlign: 'center' },
    colPrice: { width: '15%', fontSize: 9, paddingHorizontal: 5, textAlign: 'right' },
    colTotal: { width: '15%', fontSize: 9, paddingHorizontal: 5, textAlign: 'right', fontWeight: 'bold' },
    summaryWrapper: {
        marginTop: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingTop: 5,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        width: '15%',
        textAlign: 'right',
        marginRight: 5,
    },
    summaryValue: {
        fontSize: 10,
        width: '15%',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerContact: {
        fontSize: 8,
        color: '#6b7280',
    },
    footerPageNumber: {
        fontSize: 8,
        color: '#6b7280',
        textAlign: 'right',
    },
});

const formatCurrency = (amount) => {
    return amount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) || '$0';
};

function capitalizeFirstLetter(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const SimpleTestPDFContent = ({ sale, tableProductAndService, business }) => {
    const branding = getReceiptBranding(business);
    const contactParts = [
        branding.phone && `Tel: ${branding.phone}`,
        branding.email,
    ].filter(Boolean);

    return (
    <Document>
        <Page size="A4" style={styles.page}>
            <View>
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.businessName}>{branding.displayName || 'Comprobante de venta'}</Text>
                        {branding.documentNumber ? (
                            <Text style={styles.businessMeta}>
                                {branding.documentLabel}: {branding.documentNumber}
                            </Text>
                        ) : null}
                        {branding.address ? (
                            <Text style={styles.businessMeta}>{branding.address}</Text>
                        ) : null}
                    </View>
                    {branding.logoUrl ? (
                        <Image src={branding.logoUrl} style={styles.logo} />
                    ) : null}
                </View>

                <Text style={{ fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>
                    Comprobante de venta {sale?.saleNumber}
                </Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cliente:</Text>
                    <Text style={styles.detailValue}>
                        {capitalizeFirstLetter(sale.customer?.customerFirstName)}{' '}
                        {capitalizeFirstLetter(sale.customer?.customerLastName)}
                    </Text>
                    <Text style={styles.detailLabel}>Fecha:</Text>
                    <Text style={styles.detailValue}>
                        {new Date(sale?.createdAt).toLocaleDateString('es-CL')}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vendedor:</Text>
                    <Text style={styles.detailValue}>
                        {capitalizeFirstLetter(sale.user?.userFirstName)}{' '}
                        {capitalizeFirstLetter(sale.user?.userLastName)}
                    </Text>
                    <Text style={styles.detailLabel}>Observaciones:</Text>
                    <Text style={styles.detailValue}>
                        {sale?.saleComment || sale?.saleObservation || '   '}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontSize: 12, marginBottom: 5, fontWeight: 'bold', marginTop: 15 }}>
                        Detalle de la venta
                    </Text>

                    <View style={styles.tableHeader}>
                        <Text style={styles.colType}>Tipo</Text>
                        <Text style={styles.colSKU}>SKU</Text>
                        <Text style={styles.colName}>Nombre Producto/Servicio</Text>
                        <Text style={styles.colQty}>Cantidad</Text>
                        <Text style={styles.colPrice}>Precio</Text>
                        <Text style={styles.colTotal}>Total</Text>
                    </View>

                    {tableProductAndService?.map((ps) => (
                        <View style={styles.tableRow} key={ps.saleDetailId}>
                            <Text style={styles.colType}>
                                {ps.saleDetailType === 'PRODUCT' ? 'Producto' : 'Servicio'}
                            </Text>
                            <Text style={styles.colSKU}>
                                {ps.product?.productSKU || ps.service?.serviceSKU || 'N/A'}
                            </Text>
                            <Text style={styles.colName}>
                                {ps.product?.productName || ps.service?.serviceName || 'N/A'}
                            </Text>
                            <Text style={styles.colQty}>{ps.saleDetailQuantity}</Text>
                            <Text style={styles.colPrice}>{formatCurrency(ps.saleDetailPrice)}</Text>
                            <Text style={styles.colTotal}>{formatCurrency(ps.saleDetailTotal)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.summaryWrapper}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Venta:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(sale?.saleTotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Pagado:</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(sale?.saleTotal - sale?.salePendingAmount)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Pendiente:</Text>
                        <Text style={{
                            ...styles.summaryValue,
                            color: sale?.salePendingAmount > 0 ? '#b91c1c' : '#059669',
                        }}>
                            {formatCurrency(sale?.salePendingAmount)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.footerContainer} fixed>
                <View style={{ width: '70%', flexDirection: 'column' }}>
                    {contactParts.length > 0 && (
                        <Text style={styles.footerContact}>
                            {contactParts.join(' | ')}
                        </Text>
                    )}
                    {branding.social ? (
                        <Text style={styles.footerContact}>Redes: {branding.social}</Text>
                    ) : null}
                    {branding.footerNote ? (
                        <Text style={styles.footerContact}>{branding.footerNote}</Text>
                    ) : null}
                </View>

                <View style={{ width: '30%' }}>
                    <Text
                        style={styles.footerPageNumber}
                        render={({ pageNumber, totalPages }) => (
                            `Página ${pageNumber} de ${totalPages}`
                        )}
                        fixed
                    />
                </View>
            </View>
        </Page>
    </Document>
    );
};

export default SimpleTestPDFContent;

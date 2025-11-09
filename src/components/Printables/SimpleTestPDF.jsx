import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const COMPANY_INFO = {
    phone: "COMPANY_INFO.phone", // Dejamos el texto plano
    email: "opticaycristal@gmail.com",
    address: "Huérfanos 713, local 18, Santiago, Chile",
    social: "@opticaycristal.cl"
};

const styles = StyleSheet.create({
    page: {
        // Aumentamos el padding inferior para RESERVAR un espacio seguro para el footer.
        paddingTop: 30,
        paddingHorizontal: 30,
        paddingBottom: 70, // 🛑 Espacio de seguridad aumentado (70 puntos)
        fontFamily: 'Helvetica',
    },
    // --- Header Details ---
    detailRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 10,
        width: '30%',
        color: '#4b5563', // Gray 600
        fontWeight: 'bold',
    },
    detailValue: {
        fontSize: 10,
        width: '70%',
        fontWeight: 'normal',
    },
    // --- Table Headers ---
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#bfdbfe', // Blue 200
        paddingVertical: 5,
        borderBottomColor: '#374151',
        borderBottomWidth: 1,
        marginTop: 15, // 🛑 Separación clara antes de la tabla
    },
    // --- Table Rows ---
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#e5e7eb', // Gray 200
        borderBottomWidth: 1,
        paddingVertical: 4,
    },
    // --- Column Widths ---
    colType: { width: '15%', fontSize: 9, paddingHorizontal: 5 },
    colSKU: { width: '15%', fontSize: 9, paddingHorizontal: 5 },
    colName: { width: '30%', fontSize: 9, paddingHorizontal: 5 },
    colQty: { width: '10%', fontSize: 9, paddingHorizontal: 5, textAlign: 'center' },
    colPrice: { width: '15%', fontSize: 9, paddingHorizontal: 5, textAlign: 'right' },
    colTotal: { width: '15%', fontSize: 9, paddingHorizontal: 5, textAlign: 'right', fontWeight: 'bold' },

    // --- Footer/Summary ---
    summaryWrapper: {
        // 🛑 NUEVO ESTILO: Añadimos un margen superior para separarlo de la tabla de productos.
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

    // --- FOOTER STYLES ---
    footerContainer: {
        position: 'absolute', // Necesario para que sea fijo
        bottom: 20, // 🛑 Posición fija desde abajo (Queda dentro del espacio reservado por paddingBottom: 70)
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
    }
});

const formatCurrency = (amount) => {
    return amount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) || '$0';
};

function capitalizeFirstLetter(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}



// 1. Componente con exportación por defecto
const SimpleTestPDFContent = ({ sale, tableProductAndService }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Contenedor principal para el contenido que fluye */}
            <View>
                <Text style={{ fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>Comprobante de venta {sale?.saleNumber} </Text>

                {/* --- DETALLES DE LA VENTA (Header) --- */}
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cliente:</Text>
                    <Text style={styles.detailValue}>{capitalizeFirstLetter(sale.customer?.customerFirstName)} {capitalizeFirstLetter(sale.customer?.customerLastName)}</Text>
                    <Text style={styles.detailLabel}>Fecha:</Text>
                    <Text style={styles.detailValue}>{new Date(sale?.createdAt).toLocaleDateString('es-CL')}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vendedor:</Text>
                    <Text style={styles.detailValue}>{capitalizeFirstLetter(sale.user?.userFirstName)} {capitalizeFirstLetter(sale.user?.userLastName)}</Text>
                    <Text style={styles.detailLabel}>Observaciones:</Text>
                    <Text style={styles.detailValue}>{sale?.saleObservation || '   '}</Text>
                </View>

                {/* --- PRODUCT/SERVICE DETAILS TABLE --- */}
                <View style={styles.section}>
                    <Text style={{ fontSize: 12, marginBottom: 5, fontWeight: 'bold', marginTop: 15 }}>Detalle de la venta</Text>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.colType}>Tipo</Text>
                        <Text style={styles.colSKU}>SKU</Text>
                        <Text style={styles.colName}>Nombre Producto/Servicio</Text>
                        <Text style={styles.colQty}>Cantidad</Text>
                        <Text style={styles.colPrice}>Precio</Text>
                        <Text style={styles.colTotal}>Total</Text>
                    </View>

                    {/* Table Body */}
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

                {/* --- SUMMARY / TOTALS (Envuelto para asegurar separación de la tabla) --- */}
                <View style={styles.summaryWrapper}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Venta:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(sale?.saleTotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Pagado:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(sale?.saleTotal - sale?.salePendingAmount)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Pendiente:</Text>
                        <Text style={{ ...styles.summaryValue, color: sale?.salePendingAmount > 0 ? '#b91c1c' : '#059669' }}>
                            {formatCurrency(sale?.salePendingAmount)}
                        </Text>
                    </View>
                </View>
            </View>


            {/* 🛑 FOOTER: Se posiciona absolutamente en la parte inferior de la página. */}
            <View style={styles.footerContainer} fixed>

                {/* Contact Information (Left Side) */}
                <View style={{ width: '70%', flexDirection: 'column' }}>
                    <Text style={styles.footerContact}>
                        Contacto: {COMPANY_INFO.phone} | {COMPANY_INFO.email}
                    </Text>
                    <Text style={styles.footerContact}>
                        Dirección: {COMPANY_INFO.address} | Redes Sociales: {COMPANY_INFO.social}
                    </Text>
                </View>

                {/* Page Number (Right Side) */}
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

// 2. Exportación por defecto
export default SimpleTestPDFContent;
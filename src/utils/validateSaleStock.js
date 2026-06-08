/**
 * Valida stock disponible para líneas de venta (solo productos).
 * @param {Array} saleLines - filas del POS con saleDetailType, saleDetailProductServiceId, saleDetailAmount
 * @param {Array} catalog - catálogo de getProductsAndServices
 * @returns {Array<{ productId, productName, available, requested }>}
 */
export function validateSaleStockLines(saleLines, catalog) {
    const productsById = new Map(
        (catalog ?? [])
            .filter((item) => item.productId)
            .map((item) => [item.productId, item]),
    );

    const aggregates = new Map();

    for (const line of saleLines ?? []) {
        if (line.saleDetailType !== "PRODUCT" || !line.saleDetailProductServiceId) continue;
        const productId = line.saleDetailProductServiceId;
        const qty = Number(line.saleDetailAmount) || 0;
        aggregates.set(productId, (aggregates.get(productId) || 0) + qty);
    }

    const errors = [];

    for (const [productId, requested] of aggregates) {
        const product = productsById.get(productId);
        if (!product || product.productAllowZeroStock === true) continue;

        const available = Number(product.productStock ?? product.quantityOnHand ?? 0);
        if (available < requested) {
            errors.push({
                productId,
                productName: product.productName,
                available,
                requested,
            });
        }
    }

    return errors;
}

export function formatSaleStockErrors(errors) {
    return errors
        .map(
            (e) =>
                `${e.productName}: disponible ${e.available}, solicitado ${e.requested}`,
        )
        .join(" · ");
}

import formatCurrency from "./formatCurrency.js";

/**
 * Valida pagos al registrar venta según política de crédito del negocio.
 */
export function validateSalePaymentsForCreditPolicy({
    creditSalesEnabled,
    total,
    payments = [],
    totalPayments = 0,
}) {
    if (creditSalesEnabled || total <= 0) {
        return { isValid: true };
    }

    const validLines = payments.filter(
        (payment) =>
            Number(payment.amount) > 0
            && payment.methodId !== ""
            && payment.methodId !== undefined
            && payment.methodId !== null,
    );

    if (validLines.length === 0) {
        return {
            isValid: false,
            title: "Método de pago requerido",
            message:
                "Debes seleccionar un método de pago y registrar un monto igual al total de la venta.",
        };
    }

    if (Number(totalPayments) !== Number(total)) {
        return {
            isValid: false,
            title: "Monto de pago incorrecto",
            message: `El total abonado debe ser exactamente ${formatCurrency(total)}, igual al total de la venta.`,
        };
    }

    return { isValid: true };
}

export function isSalePaymentComplete({
    creditSalesEnabled,
    total,
    payments = [],
    totalPayments = 0,
}) {
    return validateSalePaymentsForCreditPolicy({
        creditSalesEnabled,
        total,
        payments,
        totalPayments,
    }).isValid;
}

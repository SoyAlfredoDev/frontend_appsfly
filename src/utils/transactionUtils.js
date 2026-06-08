export const PAYMENT_METHODS = [
    { id: "0", label: "Tarjeta de débito" },
    { id: "1", label: "Tarjeta de crédito" },
    { id: "2", label: "Efectivo" },
    { id: "3", label: "Transferencia bancaria" },
];

export const TRANSACTION_TYPE_LABELS = {
    PAYMENT: "Pago (venta)",
    EXPENSE: "Gasto",
    PURCHASE: "Compra",
    PURCHASE_CANCEL: "Anulación compra",
    ADJUSTMENT: "Ajuste manual",
};

export const TRANSACTION_DIRECTION_LABELS = {
    IN: "Entrada",
    OUT: "Salida",
};

export function parseTransactionAmount(transaction) {
    const value = transaction?.transactionNewValue;
    if (value == null) return { amount: 0, direction: "IN" };
    if (typeof value === "number") {
        return {
            amount: Math.abs(value),
            direction: value >= 0 ? "IN" : "OUT",
        };
    }
    if (typeof value === "object") {
        return {
            amount: Math.abs(Number(value.amount) || 0),
            direction: value.direction === "OUT" ? "OUT" : "IN",
        };
    }
    return { amount: 0, direction: "IN" };
}

export function formatPaymentMethod(method) {
    if (method == null || method === "") return "—";
    const found = PAYMENT_METHODS.find((m) => m.id === String(method));
    return found?.label ?? String(method);
}

export function formatTransactionType(type) {
    return TRANSACTION_TYPE_LABELS[type] ?? type ?? "—";
}

export function formatSignedAmount(transaction) {
    const { amount, direction } = parseTransactionAmount(transaction);
    const prefix = direction === "OUT" ? "−" : "+";
    return `${prefix}${amount.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
    })}`;
}

export function formatUserName(user) {
    if (!user) return "—";
    const name = `${user.userFirstName ?? ""} ${user.userLastName ?? ""}`.trim();
    return name || "—";
}

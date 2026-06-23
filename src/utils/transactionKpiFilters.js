import { parseTransactionAmount } from "./transactionUtils.js";

export const TRANSACTION_KPI_VIEWS = {
    cash: {
        title: "Efectivo disponible",
        subtitle: "Detalle de pagos y gastos en efectivo que componen la caja",
    },
    inMonth: {
        title: "Entradas del mes",
        subtitle: "Movimientos de entrada registrados en el mes en curso",
    },
    outMonth: {
        title: "Salidas del mes",
        subtitle: "Movimientos de salida registrados en el mes en curso",
    },
};

export function isInCurrentMonth(dateValue, ref = new Date()) {
    const date = new Date(dateValue);
    return (
        date.getFullYear() === ref.getFullYear()
        && date.getMonth() === ref.getMonth()
    );
}

export function filterTransactionsForKpiView(transactions, view) {
    if (!Array.isArray(transactions)) return [];

    const direction = view === "inMonth" ? "IN" : view === "outMonth" ? "OUT" : null;
    if (!direction) return [];

    return transactions.filter((row) => {
        if (!isInCurrentMonth(row.createdAt)) return false;
        return parseTransactionAmount(row).direction === direction;
    });
}

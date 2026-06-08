const INBOUND_TYPES = new Set(["COMPRA", "DEVOLUCION", "ANULACION_VENTA"]);

export function getMovementBadgeClass(movement) {
    const type = movement.movementType;
    const delta = movement.quantityDelta ?? 0;

    if (type === "AJUSTE_MANUAL") {
        return delta >= 0
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700";
    }

    if (INBOUND_TYPES.has(type)) {
        return "bg-emerald-100 text-emerald-700";
    }

    return "bg-red-100 text-red-700";
}

export function formatMovementQuantity(delta) {
    const value = Number(delta) || 0;
    return value > 0 ? `+${value}` : `${value}`;
}

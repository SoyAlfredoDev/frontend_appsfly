export const WORK_ORDER_STATUS_LABELS = {
    CREATED: "Creada",
    PENDING_SHIPMENT: "Pendiente de Envío",
    SENT_TO_LAB: "Enviada a Laboratorio",
    RECEIVED: "Recibida",
    QUALITY_CONTROL: "Control de Calidad",
    READY_FOR_DELIVERY: "Lista para Entrega",
    DELIVERED: "Entregada",
};

export const LAB_DISPATCH_STATUS_LABELS = {
    SENT: "Enviado",
    PARTIAL_RECEIVED: "Recepción parcial",
    RECEIVED: "Recibido",
    CANCELLED: "Cancelado",
};

/**
 * Transiciones permitidas para avance manual (debe reflejar backend).
 * SENT_TO_LAB se excluye porque se gestiona mediante un despacho a laboratorio.
 */
const MANUAL_ALLOWED_TRANSITIONS = {
    CREATED: ["PENDING_SHIPMENT"],
    PENDING_SHIPMENT: [],
    SENT_TO_LAB: ["RECEIVED"],
    RECEIVED: ["QUALITY_CONTROL"],
    QUALITY_CONTROL: ["READY_FOR_DELIVERY", "RECEIVED"],
    READY_FOR_DELIVERY: ["DELIVERED", "QUALITY_CONTROL"],
    DELIVERED: [],
};

export function getNextWorkOrderStatuses(current) {
    return MANUAL_ALLOWED_TRANSITIONS[current] || [];
}

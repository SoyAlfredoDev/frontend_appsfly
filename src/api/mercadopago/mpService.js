import axios from "../axios.js";

/**
 * Servicio exclusivo Mercado Pago — Checkout Bricks, confirmación y auditoría SaaS.
 * No mezclar con payment.js (pagos tenant / ventas).
 */

/** Crea preferencia + registro PENDING para Payment Brick */
export const createSubscriptionCheckout = (payload) =>
    axios.post("/subscriptions/checkout", payload);

/** Procesa onSubmit del Payment Brick (token → pago MP → suscripción) */
export const processSubscriptionPayment = ({ subscriptionPaymentId, formData, selectedPaymentMethod }) =>
    axios.post("/subscriptions/process-payment", {
        subscriptionPaymentId,
        formData,
        selectedPaymentMethod,
    });

/** Confirma pago tras retorno redirect MP (status === approved) */
export const confirmSubscriptionPayment = (paymentId, mpPaymentId) =>
    axios.post(`/subscriptions/payments/${paymentId}/confirm`, null, {
        params: { mpPaymentId },
    });

/** Consulta estado de un registro de pago SaaS */
export const getSubscriptionPaymentStatus = (paymentId) =>
    axios.get(`/subscriptions/payments/${paymentId}`);

/** Historial global de pagos (panel super admin) */
export const getAdminSubscriptionPayments = () =>
    axios.get("/admin/payments");

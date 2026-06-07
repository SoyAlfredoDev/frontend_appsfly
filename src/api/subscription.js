import axios from "./axios.js"

export const getSubscriptionsByBusinessIdRequest = (businessId) => axios.get(`/subscriptions/${businessId}`);

/** Plan promocional $0 — sin Mercado Pago */
export const createSubscriptionRequest = (subscription) => axios.post('/subscriptions', subscription);

import axios from "./axios.js";

export const getBusinessBillingRequest = (businessId) =>
    axios.get(`/subscriptions/billing/${businessId}`);

export const cancelBusinessSubscriptionRequest = (businessId, { confirmationPhrase, cancelReason } = {}) =>
    axios.post(`/subscriptions/billing/${businessId}/cancel`, {
        confirmationPhrase,
        cancelReason,
    });

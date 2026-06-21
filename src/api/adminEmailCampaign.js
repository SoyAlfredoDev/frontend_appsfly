import axios from "./axios.js";

export const getEmailCampaignMetadataRequest = () =>
    axios.get("/admin/email-campaigns/metadata");

export const ensureSystemEmailCampaignsRequest = () =>
    axios.post("/admin/email-campaigns/ensure-system");

export const getEmailCampaignsRequest = () => axios.get("/admin/email-campaigns");

export const getEmailCampaignRequest = (campaignId) =>
    axios.get(`/admin/email-campaigns/${campaignId}`);

export const getEmailCampaignStatsRequest = (campaignId) =>
    axios.get(`/admin/email-campaigns/${campaignId}/stats`);

export const previewEmailCampaignMessageRequest = (campaignId) =>
    axios.get(`/admin/email-campaigns/${campaignId}/preview-message`);

export const executeEmailCampaignRequest = (campaignId, { force = false } = {}) =>
    axios.post(`/admin/email-campaigns/${campaignId}/execute`, { force });

export const createEmailCampaignRequest = (data) =>
    axios.post("/admin/email-campaigns", data);

export const updateEmailCampaignRequest = (campaignId, data) =>
    axios.patch(`/admin/email-campaigns/${campaignId}`, data);

export const deleteEmailCampaignRequest = (campaignId) =>
    axios.delete(`/admin/email-campaigns/${campaignId}`);

export const previewEmailCampaignAudienceRequest = (audienceType) =>
    axios.post("/admin/email-campaigns/preview-audience", { audienceType });

export const SYSTEM_CAMPAIGN_KEY_MONTHLY_SUSPENDED = "monthly-suspended-reactivation";
export const SYSTEM_CAMPAIGN_KEY_DAILY_PLAN_EXPIRY_5D = "daily-plan-expiry-warning-5d";
export const SYSTEM_CAMPAIGN_KEY_DAILY_PLAN_EXPIRY_TODAY = "daily-plan-expiry-today";

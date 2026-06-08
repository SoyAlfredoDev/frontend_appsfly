import axios from "./axios.js";

export const getAsmrCampaigns = (config) => axios.get("/asmr-campaigns", config);

export const getAsmrCampaignSummary = (config) =>
    axios.get("/asmr-campaigns/summary", config);

export const segmentAsmrCampaign = (data) =>
    axios.post("/asmr-campaigns/segment", data);

export const executeAsmrCampaign = (data) =>
    axios.post("/asmr-campaigns/execute", data);
